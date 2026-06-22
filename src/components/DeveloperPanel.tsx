import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Code, Cpu, Clock, AlertTriangle, ChevronRight, ChevronLeft, EyeOff, Copy, Check, FileJson } from 'lucide-react';
import type { RecommendationsMetadata } from '../services/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DeveloperPanelProps {
  metadata: RecommendationsMetadata | null;
  isOpen: boolean;
  onToggle: () => void;
  curlCommand: string; // The curl command for the active audited query
  rawApiResponse?: any; // The raw JSON API response
}

interface HoverHelp {
  title: string;
  explanation: string;
  lower: string;
  higher: string;
  rect: DOMRect;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  metadata,
  isOpen,
  onToggle,
  curlCommand,
  rawApiResponse,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'prompt' | 'raw' | 'excluded' | 'curl' | 'json'>('logs');
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('chatbot_dev_panel_width');
    return saved ? parseInt(saved, 10) : 768;
  }); // Double the previous width (768px instead of 384px) by default
  const [isDragging, setIsDragging] = useState(false);

  // Save dev panel width choice
  useEffect(() => {
    localStorage.setItem('chatbot_dev_panel_width', String(width));
  }, [width]);
  const [isCopied, setIsCopied] = useState(false);
  const [hoverHelp, setHoverHelp] = useState<HoverHelp | null>(null);
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

  const handleCopyCurl = async () => {
    if (!curlCommand) return;
    try {
      await navigator.clipboard.writeText(curlCommand);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Viewport Collision-Aware Tooltip Positioning Algorithm
  const calculateTooltipStyles = (rect: DOMRect | null) => {
    if (!rect) return {};

    const tooltipWidth = 320;
    const tooltipHeight = 420; // Increased to 420px to prevent scrollbars completely
    const margin = 12;

    // 1. Horizontal Placement (Prefer left since panel is on the right edge)
    let left = rect.left - tooltipWidth - margin;
    if (left < 0) {
      left = rect.right + margin;
    }
    left = Math.max(margin, left);

    // 2. Vertical Placement (Center to element, clamp inside viewport)
    let top = rect.top + rect.height / 2 - tooltipHeight / 2;
    top = Math.max(margin, top);
    top = Math.min(top, window.innerHeight - tooltipHeight - margin);

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${tooltipWidth}px`,
      maxHeight: `${tooltipHeight}px`,
    };
  };

  // Early return if the developer panel is collapsed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 border-l border-y border-slate-800 hover:border-slate-700 text-slate-400 hover:text-violet-400 p-2 rounded-l-2xl shadow-2xl z-40 transition flex flex-col items-center space-y-1 cursor-pointer"
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

  // Format elapsedTime from h:mm:ss.ss to total seconds, e.g. "3.45s"
  const rawElapsedTime = metadata?.elapsed_time || 'N/A';
  const formatToSeconds = (timeStr: string) => {
    if (!timeStr || timeStr === 'N/A') return 'N/A';
    if (timeStr.endsWith('s')) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseFloat(parts[2]);
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return `${totalSeconds.toFixed(2)}s`;
      }
    }
    return timeStr;
  };
  const elapsedTime = formatToSeconds(rawElapsedTime);
  const logs = metadata?.logs || [];
  const excludedItems = metadata?.excluded_items || [];

  // Sophisticated formatter for Raw LLM Responses (parses <think> blocks)
  const renderRawResponseContent = (raw: string) => {
    if (!raw) {
      return (
        <div className="text-slate-600 italic py-8 text-center font-sans">
          No raw LLM content found. Make sure you enable "Include RAG Metadata" in settings and make a query.
        </div>
      );
    }

    const thinkMatch = raw.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      const thinkContent = thinkMatch[1].trim();
      const remainingContent = raw.replace(/<think>[\s\S]*?<\/think>/, '').trim();

      return (
        <div className="space-y-4 font-mono text-xs text-left w-full h-full">
          {/* Proceso de Pensamiento (Amber Card) */}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 space-y-2 select-all font-sans">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-[10px] uppercase tracking-wider border-b border-amber-500/10 pb-1.5 font-sans">
              <span>🧠</span>
              <span>Proceso de Razonamiento (Chain of Thought)</span>
            </div>
            <div className="text-slate-400 leading-relaxed text-[11px] whitespace-pre-wrap italic font-mono">
              {thinkContent}
            </div>
          </div>

          {/* Respuesta Final (Emerald Card) */}
          {remainingContent && (
            <div className="space-y-2 select-all h-full font-sans">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                <span>🎯</span>
                <span>Respuesta Estructurada Final</span>
              </div>
              <div className="bg-slate-950 border border-slate-855 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-400 shadow-inner font-mono">
                {remainingContent}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default syntax box for non-reasoning output
    return (
      <div className="bg-slate-950 border border-slate-855 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-400 shadow-inner select-all">
        {raw}
      </div>
    );
  };

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
        <div
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverHelp({
              title: 'Tiempo de Respuesta (Latencia)',
              explanation: 'Mide los segundos transcurridos desde que envías tu mensaje hasta que se renderiza el resultado final. Suma: búsqueda semántica/colaborativa + inferencia local de Ollama + mapeo de metadatos.',
              lower: 'Inferencia ultra rápida (ej. usando gemma3:4b o modelos de menos parámetros).',
              higher: 'Inferencia pesada (ej. usando deepseek-r1 o modelos de razonamiento profundo).',
              rect,
            });
          }}
          onMouseLeave={() => setHoverHelp(null)}
          className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1 text-left shadow-md cursor-help hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Pipeline Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-slate-200">{elapsedTime}</p>
          <p className="text-[10px] text-slate-500">Retrieval + LLM context decision and metadata mapping</p>
        </div>

        <div
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverHelp({
              title: 'Candidatos Excluidos (Post-LLM Filtering / Augmentation Mismatch)',
              explanation: 'Representan las películas que fueron extraídas de la base de datos durante la fase de "Augmentation" (Búsqueda Vectorial por similitud a partir de los títulos que devolvió el LLM) pero que la RecommendationsFactory consideró que no eran lo suficientemente similares al título o año original sugerido por el LLM, o bien que ya habían sido agregadas previamente. Se excluyen en la etapa de Resolución final para mantener la precisión.',
              lower: 'Alta precisión del RAG: los candidatos extraídos coincidieron casi a la perfección con lo que propuso el LLM (Cosine Similarity alto).',
              higher: 'El Augmentation trajo mucha "basura": películas semánticamente lejanas al título/año propuesto por el LLM, por ende fueron descartadas.',
              rect,
            });
          }}
          onMouseLeave={() => setHoverHelp(null)}
          className="bg-slate-950 border border-slate-855 p-4 rounded-xl space-y-1 text-left shadow-md cursor-help hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Filtered Out Candidates</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-200">{excludedItems.length} movies</p>
          <p className="text-[10px] text-slate-500">Candidates rejected by the LLM context filter</p>
        </div>
      </div>

      {/* Tabs (Horizontal Navigation - 6 tabs) */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 shrink-0 text-xs gap-2 pl-6 overflow-x-auto">
        {[
          { id: 'logs', label: 'Engine Execution Logs', icon: Terminal },
          { id: 'prompt', label: 'Raw Prompt Template', icon: Code },
          { id: 'raw', label: 'Verbatim LLM Response', icon: Cpu },
          { id: 'excluded', label: 'Excluded Movies List', icon: EyeOff },
          { id: 'curl', label: 'CURL Request', icon: Terminal },
          { id: 'json', label: 'REST JSON Response', icon: FileJson }, // NEW TAB!
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl font-bold transition border shrink-0 min-w-[90px] ${
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
              <div className="text-slate-600 italic py-8 text-center font-sans">No active logs captured. Ask a question to see real-time logs.</div>
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
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-855 overflow-auto flex-1 select-all relative whitespace-pre-wrap leading-relaxed text-[11px] text-indigo-300 shadow-inner">
              {promptText ? promptText : <div className="text-slate-600 italic py-8 text-center font-sans">No prompt captured. Enable metadata in settings.</div>}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2 h-full flex flex-col overflow-y-auto">
            {renderRawResponseContent(rawResponse)}
          </div>
        )}

        {activeTab === 'excluded' && (
          <div className="h-full overflow-y-auto">
            {excludedItems.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-855 text-slate-500 italic text-center shadow-inner font-sans">
                No candidate movies were filtered out by the LLM context filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {excludedItems.map((movie) => (
                  <div
                    key={movie.title}
                    className="bg-slate-950 border border-slate-855/80 p-4 rounded-xl text-[11px] space-y-2.5 text-left flex flex-col justify-between"
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
                      <p className="text-slate-400 line-clamp-3 leading-relaxed font-sans">{movie.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2 border-t border-slate-900 pt-1.5">
                      {movie.genres.map((g) => (
                        <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-855 font-sans">
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

        {/* CURL REQUEST TAB PANEL */}
        {activeTab === 'curl' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between font-sans">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Bash CURL Command Auditor
              </span>
              {curlCommand && (
                <button
                  onClick={handleCopyCurl}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-855 hover:text-white'
                  }`}
                  title="Copiar comando CURL al portapapeles"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy CURL</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 overflow-auto flex-1 select-all relative whitespace-pre leading-relaxed text-[11px] text-violet-400 shadow-inner">
              {curlCommand ? (
                curlCommand
              ) : (
                <div className="text-slate-600 italic py-8 text-center font-sans">
                  No active query captured. Make a request to audit its raw CURL command.
                </div>
              )}
            </div>
          </div>
        )}

        {/* JSON RESPONSE TAB PANEL */}
        {activeTab === 'json' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between font-sans">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Raw API JSON Response
              </span>
              {rawApiResponse && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(JSON.stringify(rawApiResponse, null, 2));
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    } catch (err) {
                      console.error('Failed to copy text:', err);
                    }
                  }}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-855 hover:text-white'
                  }`}
                  title="Copiar JSON al portapapeles"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 overflow-auto flex-1 relative shadow-inner">
              {rawApiResponse ? (
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  wrapLongLines={true}
                  customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '11px' }}
                >
                  {JSON.stringify(rawApiResponse, null, 2)}
                </SyntaxHighlighter>
              ) : (
                <div className="text-slate-600 italic py-8 text-center font-sans">
                  No active API response captured. Make a request to see the raw JSON.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Viewport-level Hover Tooltip */}
      {hoverHelp && (
        <div
          style={calculateTooltipStyles(hoverHelp.rect)}
          className="bg-slate-950/95 border border-slate-800 text-[11px] text-slate-300 rounded-2xl shadow-2xl space-y-3 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 font-sans leading-relaxed backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="font-bold text-slate-100 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 shrink-0">
            <span>💡</span>
            <span>{hoverHelp.title}</span>
          </div>
          <p className="font-medium text-slate-300 shrink-0">{hoverHelp.explanation}</p>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-900 font-sans shrink-0">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850/40">
              <span className="font-bold text-indigo-400 block mb-0.5 uppercase tracking-wider text-[8px]">Valores Bajos:</span>
              <span className="text-slate-400 font-normal">{hoverHelp.lower}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850/40">
              <span className="font-bold text-violet-400 block mb-0.5 uppercase tracking-wider text-[8px]">Valores Altos:</span>
              <span className="text-slate-400 font-normal">{hoverHelp.higher}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
