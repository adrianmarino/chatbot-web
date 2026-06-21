import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, ArrowRight, Loader2, Bot, User, Menu, RotateCw, CheckCircle2, MessageSquare, Film, Lock, Unlock, Award } from 'lucide-react';
import { api } from '../services/api';
import type { Recommendation, RecommendationsMetadata } from '../services/api';
import { MovieGrid } from './MovieGrid';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'success' | 'error';
  recommendations?: Recommendation[];
  queryText?: string;
  metadata?: RecommendationsMetadata | null;
  curlCommand?: string;
}

interface ChatFeedProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  activeProfileName: string | undefined;
  activeProfileEmail: string | undefined;
  onRateMovie: (movie: Recommendation, rating: number) => Promise<void>;
  ratedMovies: Record<string, number>;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedMessageId: string | null;
  onSelectMessage: (id: string, metadata: RecommendationsMetadata | null, curlCommand: string) => void;
}

const SUGGESTED_PROMPTS = [
  'Recommend a high-rating 90s action thriller',
  'I want a modern sci-fi movie with high ratings',
  'What is a good psychological horror for a rainy day?',
  'Recommend some light-hearted classic comedies',
];

interface HoverHelp {
  title: string;
  explanation: string;
  lower: string;
  higher: string;
  rect: DOMRect;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  isLoading,
  activeProfileName,
  activeProfileEmail,
  onRateMovie,
  ratedMovies,
  isSidebarOpen,
  onToggleSidebar,
  selectedMessageId,
  onSelectMessage,
}) => {
  const [inputText, setInputText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'chat' | 'ratings'>('chat');
  const [seenMovies, setSeenMovies] = React.useState<Recommendation[]>([]);
  const [isLoadingSeen, setIsLoadingSeen] = React.useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoverHelp, setHoverHelp] = React.useState<HoverHelp | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeTab]);

  useEffect(() => {
    if (activeTab !== 'ratings' || !activeProfileEmail) return;

    let isMounted = true;
    async function fetchSeen() {
      setIsLoadingSeen(true);
      try {
        const data = await api.getSeenMovies(activeProfileEmail!);
        const formatted: Recommendation[] = data.map((item) => ({
          title: item.title,
          description: item.description,
          release: item.release,
          genres: item.genres || [],
          votes: [],
          poster: item.poster,
          metadata: {
            result_item: { position: 0, title: item.title },
            db_item: {
              id: item.id,
              title: item.title,
              release: item.release,
              rating: item.rating,
              query_sim: 0,
              title_sim: 0,
              release_sim: 0,
            },
          },
        }));
        if (isMounted) {
          setSeenMovies(formatted);
        }
      } catch (err) {
        console.error('Error fetching seen movies:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSeen(false);
        }
      }
    }
    fetchSeen();

    return () => {
      isMounted = false;
    };
  }, [activeTab, activeProfileEmail, Object.keys(ratedMovies).length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // High-fidelity Lightweight Markdown Renderer
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check if line is a bullet/numbered list item
      const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
      
      const applyFormatting = (nodes: React.ReactNode[]): React.ReactNode[] => {
        let result = [...nodes];
        
        // Pass 1: Bold (**)
        let temp: React.ReactNode[] = [];
        result.forEach(node => {
          if (typeof node !== 'string') {
            temp.push(node);
            return;
          }
          const boldRegex = /\*\*(.*?)\*\*/g;
          let lastIndex = 0;
          let match;
          while ((match = boldRegex.exec(node)) !== null) {
            if (match.index > lastIndex) {
              temp.push(node.substring(lastIndex, match.index));
            }
            temp.push(<strong key={`bold-${match.index}`} className="font-bold text-slate-100">{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
          }
          if (lastIndex < node.length) {
            temp.push(node.substring(lastIndex));
          }
        });
        result = temp;
        
        // Pass 2: Italic (*)
        temp = [];
        result.forEach(node => {
          if (typeof node !== 'string') {
            temp.push(node);
            return;
          }
          const italicRegex = /\*(.*?)\*/g;
          let lastIndex = 0;
          let match;
          while ((match = italicRegex.exec(node)) !== null) {
            if (match.index > lastIndex) {
              temp.push(node.substring(lastIndex, match.index));
            }
            temp.push(<em key={`italic-${match.index}`} className="italic text-slate-300">{match[1]}</em>);
            lastIndex = italicRegex.lastIndex;
          }
          if (lastIndex < node.length) {
            temp.push(node.substring(lastIndex));
          }
        });
        result = temp;
        
        return result;
      };

      if (listMatch) {
        const indent = listMatch[1].length * 4;
        const bullet = listMatch[2];
        const content = listMatch[3];
        const formattedContent = applyFormatting([content]);
        
        return (
          <div key={idx} className="flex items-start py-1" style={{ paddingLeft: `${indent}px` }}>
            <span className="text-violet-400 font-bold mr-2 select-none shrink-0">{bullet}</span>
            <span className="flex-1">{formattedContent}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      const formattedLine = applyFormatting([line]);
      return (
        <p key={idx} className="mb-1 last:mb-0 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  // Viewport Collision-Aware Tooltip Positioning Algorithm
  const calculateTooltipStyles = (rect: DOMRect | null) => {
    if (!rect) return {};

    const tooltipWidth = 320;
    const tooltipHeight = 250; // slightly shorter for chat buttons
    const margin = 12;

    // 1. Horizontal Placement (Prefer right, fallback to left)
    let left = rect.right + margin;
    if (left + tooltipWidth > window.innerWidth) {
      left = rect.left - tooltipWidth - margin;
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

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative overflow-hidden">
      {/* Feed Header */}
      <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center space-x-3 text-left">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverHelp({
                title: 'Alternar Barra Lateral / Toggle Sidebar',
                explanation: 'Oculta o expande la barra lateral de perfiles. Colapsarla maximiza el área de visualización del chat, dándote espacio de pantalla completa (Workbench) para evaluar las películas e insights side-by-side.',
                lower: 'Barra lateral fija de 320px visible.',
                higher: 'Pantalla completa; chat e insights comparten la totalidad del monitor.',
                rect,
              });
            }}
            onMouseLeave={() => setHoverHelp(null)}
            className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-855 rounded-lg transition mr-1 animate-in"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Recommendation Chat</span>
            </h2>
            {activeProfileName && (
              <p className="text-[11px] text-slate-500 font-medium">
                Consulting as <span className="text-violet-400 font-semibold">{activeProfileName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Beautiful Segmented Tab Switcher */}
        <div className="bg-slate-950/80 p-0.5 rounded-xl border border-slate-800/80 flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'chat'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversational Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ratings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'ratings'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>My Ratings</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 0 && activeTab === 'chat' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear this conversation history?')) {
                  onClearHistory();
                }
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverHelp({
                  title: 'Clear Context Memory / Resetear Historial',
                  explanation: 'Borra permanentemente el historial conversacional (memoria a corto plazo) de este usuario de MongoDB. Esto evita que los temas y películas hablados anteriormente sesguen tus nuevas consultas.',
                  lower: 'Se mantiene el hilo y contexto previo.',
                  higher: 'Wipe total; el LLM te atenderá sin memoria previa, libre de sesgos contextuales.',
                  rect,
                });
              }}
              onMouseLeave={() => setHoverHelp(null)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset History</span>
            </button>
          )}
        </div>
      </div>

      {/* Conditionally Render Chat Feed or Ratings View */}
      {activeTab === 'chat' ? (
        <>
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.length === 0 ? (
              /* Empty State UX */
              <div className="max-w-2xl mx-auto text-center py-12 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
                <div className="space-y-3">
                  <div className="inline-flex p-4 bg-gradient-to-tr from-violet-600/20 to-indigo-500/20 rounded-2xl border border-violet-500/10 text-violet-400 shadow-xl shadow-violet-500/5 mb-2">
                    <Bot className="w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Ask your Hybrid Recommendation System
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Type a message describing what kind of movie you want. The system uses a RAG search or Collaborative Filtering candidates list, which is then ranked by a Large Language Model.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Try asking one of these:
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => onSendMessage(prompt)}
                        className="p-3 bg-slate-900/60 border border-slate-855 hover:border-slate-700 rounded-2xl text-left text-xs font-medium text-slate-300 hover:text-slate-100 transition group flex items-start justify-between"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition ml-2 shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Chat Thread */
              <div className="max-w-3xl mx-auto space-y-6 text-left">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const hasRecs = msg.recommendations && msg.recommendations.length > 0;
                  const isSelected = selectedMessageId === msg.id;

                  return (
                    <div key={msg.id} className="space-y-4">
                      {/* Chat Bubble Row */}
                      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                        <div className={`flex items-start space-x-3 w-full max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div
                            className={`p-2.5 rounded-xl border shrink-0 ${
                              isUser
                                ? 'bg-violet-600/15 border-violet-500/20 text-violet-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>

                          {/* Speech Bubble containing text and/or recommendations grid natively! */}
                          <div
                            onClick={() => {
                              if (!isUser && hasRecs) {
                                onSelectMessage(msg.id, msg.metadata || null, msg.curlCommand || '');
                              }
                            }}
                            className={`rounded-2xl px-4 py-3 text-sm text-left shadow-lg transition-all duration-200 ${
                              isUser
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-indigo-500/5'
                                : `bg-slate-900 border text-slate-200 leading-relaxed shadow-slate-950/20 w-full ${
                                    hasRecs ? 'cursor-pointer hover:border-violet-500/40 hover:bg-slate-900/80' : 'border-slate-800/80'
                                  } ${
                                    isSelected ? 'border-violet-500 ring-2 ring-violet-500/20 scale-[1.005] bg-slate-900/90' : 'border-slate-800/80'
                                  }`
                            }`}
                            title={(!isUser && hasRecs) ? "Haga clic para ver los insights técnicos de este mensaje" : undefined}
                          >
                            {isUser ? (
                              msg.text
                            ) : (
                              <div className="space-y-4">
                                {/* 1. If text is present, render formatted text */}
                                {msg.text && (
                                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                                )}
                                
                                {/* 2. Nest recommendations grid natively inside the speech bubble */}
                                {msg.recommendations && (
                                  <MovieGrid
                                    movies={msg.recommendations}
                                    onRateMovie={onRateMovie}
                                    ratedMovies={ratedMovies}
                                  />
                                )}
                              </div>
                            )}
                            
                            {/* Footer row inside the bubble */}
                            <div className="flex items-center justify-between mt-1.5 opacity-50 font-medium">
                              {isSelected && !isUser && hasRecs ? (
                                <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider flex items-center space-x-1 pl-1">
                                  <CheckCircle2 className="w-3 h-3 text-violet-400 animate-pulse" />
                                  <span>Active Insights View</span>
                                </span>
                              ) : (
                                <span />
                              )}
                              <span className="text-[10px]">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Refresh Button on User Bubble (rendered outside but next to the bubble) */}
                          {isUser && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                onSendMessage(msg.text);
                              }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoverHelp({
                                  title: 'Volver a Consultar / Refresh Query',
                                  explanation: 'Relanza esta misma pregunta usando tus parámetros y modelos actuales de la barra lateral. Útil para re-calcular recomendaciones tras mover deslizadores.',
                                  lower: 'Conserva el chat y evita re-escribir la pregunta.',
                                  higher: 'Dispara una nueva inferencia en bruto con los parámetros vigentes.',
                                  rect,
                                });
                              }}
                              onMouseLeave={() => setHoverHelp(null)}
                              className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-slate-900 rounded-xl transition self-center shrink-0 cursor-pointer"
                              title="Refresh this query with current settings"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pipeline / Loading State */}
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="flex items-start space-x-3 w-full max-w-[85%]">
                      {/* pulsing Bot icon */}
                      <div className="p-2.5 rounded-xl border shrink-0 bg-slate-900 border-slate-800 text-violet-400">
                        <Bot className="w-4 h-4 animate-pulse" />
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl px-5 py-4 text-left shadow-lg w-full space-y-4">
                        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-100">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                          <span>Hybrid Engine is Processing...</span>
                        </div>
                        
                        {/* Pipeline steps animation */}
                        <div className="text-xs space-y-2.5 pl-5 relative border-l border-slate-800">
                          <div className="flex items-center space-x-2 text-violet-400 font-medium animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></span>
                            <span>🔍 Checking user history & profile (Determining Cold/Warm start)</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 animate-ping"></span>
                            <span>🧬 Retrieving candidate movies via RAG & Collaborative Filtering</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                            <span>🤖 Filtering and ranking candidates using selected LLM</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                            <span>🎬 Finalizing movie data & posters formatting</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input Form Footer */}
          <div className="p-6 bg-slate-900/30 border-t border-slate-800/80 backdrop-blur-md z-10 shrink-0">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask for a recommendation... (e.g. 'I want a sci-fi mystery')"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition pr-12 disabled:opacity-50"
                />
                <div className="absolute right-4 top-3.5 text-slate-500 text-xs">
                  ⌘ Enter
                </div>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition shrink-0 disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-950/20 pb-8 space-y-6">
          {/* Gamified progress banner */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/10">
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-4xl mx-auto text-left shadow-lg animate-in fade-in duration-200 ${
              Object.keys(ratedMovies).length >= 20 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                : 'bg-amber-500/5 border-amber-500/15 text-amber-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {Object.keys(ratedMovies).length >= 20 ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-500" />}
                  <h3 className="font-bold text-sm tracking-tight">
                    {Object.keys(ratedMovies).length >= 20 ? 'Collaborative Filtering Unlocked!' : 'Collaborative Filtering Progress'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  {Object.keys(ratedMovies).length >= 20 
                    ? 'Your profile is successfully warm-started. You have provided enough ratings to activate cooperative recommendations and neighbor-based neural similarity!' 
                    : 'To unlock neural collaborative recommendations, your profile needs at least 20 ratings in MongoDB. Rate movies inside chat recommendations to build your profile.'}
                </p>
              </div>
              <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Your Ratings</span>
                  <span className={`text-lg font-black ${Object.keys(ratedMovies).length >= 20 ? 'text-emerald-400' : 'text-amber-500'}`}>{Object.keys(ratedMovies).length} / 20</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900">
                  <Award className={`w-4 h-4 ${Object.keys(ratedMovies).length >= 20 ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Movies Content Area */}
          {isLoadingSeen ? (
            <div className="py-16 flex items-center justify-center w-full">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : seenMovies.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans max-w-xl mx-auto w-full">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 animate-in zoom-in-95 duration-200">
                <Film className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">You haven't rated any movies yet</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Movies you rate with stars in your recommendations will appear in this section. Try rating movies to build your profile!
              </p>
            </div>
          ) : (
            <div className="px-6 max-w-4xl mx-auto w-full">
              <MovieGrid
                movies={seenMovies}
                onRateMovie={onRateMovie}
                ratedMovies={ratedMovies}
              />
            </div>
          )}
        </div>
      )}

            {/* Global Viewport-Level Draggable/Floating Hover Tooltip (Fixed position, 100% immune to scroll clippings) */}
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
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-855/40">
              <span className="font-bold text-indigo-400 block mb-0.5 uppercase tracking-wider text-[8px]">Valores Bajos:</span>
              <span className="text-slate-400 font-normal">{hoverHelp.lower}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-855/40">
              <span className="font-bold text-violet-400 block mb-0.5 uppercase tracking-wider text-[8px]">Valores Altos:</span>
              <span className="text-slate-400 font-normal">{hoverHelp.higher}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
