import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Code, Cpu, Clock, AlertTriangle, ChevronRight, ChevronLeft, EyeOff } from 'lucide-react';
import type { RecommendationsMetadata } from '../services/api';

interface DeveloperPanelProps {
  metadata: RecommendationsMetadata | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  metadata,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'prompt' | 'raw' | 'excluded'>('logs');
  const [width, setWidth] = useState(768); // Double the previous width (768px instead of 384px) by default
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Drag handlers for resizability
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      // Clamp width between 350px (compact) and 1000px (ultrawide)
      if (newWidth >= 350 && newWidth <= 1000) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 border-l border-y border-slate-800 hover:border-slate-700 text-slate-400 hover:text-violet-400 p-2 rounded-l-2xl shadow-2xl z-40 transition flex flex-col items-center space-y-1"
        title="Open research insights"
      >
        <ChevronLeft className="w-5 h-5 animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-widest writing-mode-vertical rotate-180">
          Insights
        </span>
      </button>
    );
  }

  const promptText = metadata?.response?.metadata?.prompt || '';
  const rawResponse = metadata?.response?.content || '';
  const elapsedTime = metadata?.elapsed_time || 'N/A';
  const logs = metadata?.logs || [];
  const excludedItems = metadata?.excluded_items || [];

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-screen overflow-hidden shrink-0 z-30 shadow-2xl animate-in slide-in-from-right duration-200 relative"
    >
      {/* Draggable Resizer Handler */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 transition-all ${
          isDragging ? 'bg-violet-500 w-2' : 'bg-slate-800/80 hover:bg-violet-500/55 hover:w-2'
        }`}
        title="Drag to resize panel"
      />

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 pl-6 shrink-0">
        <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>Research & Engine Insights Console</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 shrink-0 border-b border-slate-800 bg-slate-950/20 pl-6">
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1 text-left shadow-md">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Pipeline Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-slate-200">{elapsedTime}</p>
          <p className="text-[10px] text-slate-500">Retrieval + LLM context decision and metadata mapping</p>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1 text-left shadow-md">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Filtered Out Candidates</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-200">{excludedItems.length} movies</p>
          <p className="text-[10px] text-slate-500">Candidates rejected by the LLM context filter</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 shrink-0 text-xs gap-2 pl-6">
        {[
          { id: 'logs', label: 'Engine Execution Logs', icon: Terminal },
          { id: 'prompt', label: 'Raw Prompt Template', icon: Code },
          { id: 'raw', label: 'Verbatim LLM Response', icon: Cpu },
          { id: 'excluded', label: 'Excluded Movies List', icon: EyeOff },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold transition border ${
                active
                  ? 'bg-slate-800 text-violet-400 border-slate-750 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 border-transparent bg-slate-950/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 text-left font-mono text-xs pl-6 bg-slate-950/20">
        {activeTab === 'logs' && (
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-full overflow-y-auto shadow-inner">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">No active logs captured. Ask a question to see real-time logs.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-2.5 mb-2.5 last:border-0 text-slate-300 leading-relaxed text-[11px] flex">
                  <span className="text-slate-600 select-none mr-3 shrink-0">[{idx + 1}]</span>
                  <span className="flex-1">{log}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-auto flex-1 select-all relative whitespace-pre-wrap leading-relaxed text-[11px] text-indigo-300 shadow-inner">
              {promptText ? promptText : <div className="text-slate-600 italic py-8 text-center">No prompt captured. Enable metadata in settings.</div>}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-auto flex-1 select-all whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-400 shadow-inner">
              {rawResponse ? rawResponse : <div className="text-slate-600 italic py-8 text-center">No raw LLM content. Enable metadata in settings.</div>}
            </div>
          </div>
        )}

        {activeTab === 'excluded' && (
          <div className="h-full overflow-y-auto">
            {excludedItems.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 text-slate-500 italic text-center shadow-inner">
                No candidate movies were filtered out by the LLM context filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {excludedItems.map((movie) => (
                  <div
                    key={movie.title}
                    className="bg-slate-950 border border-slate-850/80 p-4 rounded-xl text-[11px] space-y-2.5 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                        <div className="truncate">
                          <h5 className="font-bold text-slate-200 truncate">{movie.title}</h5>
                          <span className="text-slate-500 text-[10px]">{movie.release}</span>
                        </div>
                        {movie.metadata?.db_item?.query_sim !== undefined && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/15 shrink-0 ml-2">
                            Sim: {movie.metadata.db_item.query_sim.toFixed(3)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 line-clamp-3 leading-relaxed">{movie.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2 border-t border-slate-900 pt-1.5">
                      {movie.genres.map((g) => (
                        <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-850">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
