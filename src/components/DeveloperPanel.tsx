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
  const [width, setWidth] = useState(384); // Default 384px (w-96)
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Drag handers for resizability
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new width (it is on the right side of the screen)
      const newWidth = window.innerWidth - e.clientX;
      // Clamp width between 300px and 800px
      if (newWidth >= 300 && newWidth <= 800) {
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
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 pl-6">
        <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>Research & Engine Insights</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-3 shrink-0 border-b border-slate-800 bg-slate-950/20 pl-6">
        <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1 text-left">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase">Latency</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-sm font-extrabold text-slate-200">{elapsedTime}</p>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1 text-left">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase">Excluded</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-sm font-extrabold text-slate-200">{excludedItems.length} movies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 shrink-0 text-xs gap-1 pl-6">
        {[
          { id: 'logs', label: 'Logs', icon: Terminal },
          { id: 'prompt', label: 'Prompt', icon: Code },
          { id: 'raw', label: 'Raw AI', icon: Cpu },
          { id: 'excluded', label: 'Excluded', icon: EyeOff },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg font-semibold transition ${
                active
                  ? 'bg-slate-800 text-violet-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 text-left font-mono text-xs pl-6">
        {activeTab === 'logs' && (
          <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850 h-full overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">No execution logs loaded.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-1.5 mb-1.5 last:border-0 text-slate-300 leading-relaxed text-[11px]">
                  <span className="text-slate-600 select-none mr-2">[{idx + 1}]</span>
                  {log}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 overflow-auto flex-1 select-all relative whitespace-pre-wrap leading-relaxed text-[11px] text-indigo-300">
              {promptText ? promptText : <span className="text-slate-600 italic">No prompt captured. Enable metadata in settings.</span>}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 overflow-auto flex-1 select-all whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-400">
              {rawResponse ? rawResponse : <span className="text-slate-600 italic">No raw LLM content. Enable metadata in settings.</span>}
            </div>
          </div>
        )}

        {activeTab === 'excluded' && (
          <div className="space-y-3 h-full overflow-y-auto">
            {excludedItems.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-500 italic text-center">
                No items were discarded by the LLM context filter.
              </div>
            ) : (
              excludedItems.map((movie) => (
                <div
                  key={movie.title}
                  className="bg-slate-950 border border-slate-850/80 p-3 rounded-xl text-[11px] space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-200">{movie.title}</h5>
                      <span className="text-slate-500 text-[10px]">{movie.release}</span>
                    </div>
                    {movie.metadata?.db_item?.query_sim !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/15">
                        Sim: {movie.metadata.db_item.query_sim.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 line-clamp-2">{movie.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
