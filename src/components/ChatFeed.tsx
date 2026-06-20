import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, ArrowRight, Loader2, Bot, User } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'success' | 'error';
}

interface ChatFeedProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  activeProfileName: string | undefined;
}

const SUGGESTED_PROMPTS = [
  'Recommend a high-rating 90s action thriller',
  'I want a modern sci-fi movie with high ratings',
  'What is a good psychological horror for a rainy day?',
  'Recommend some light-hearted classic comedies',
];

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  isLoading,
  activeProfileName,
}) => {
  const [inputText, setInputText] = React.useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative overflow-hidden">
      {/* Feed Header */}
      <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md z-10">
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Recommendation Chat</span>
          </h2>
          {activeProfileName && (
            <p className="text-xs text-slate-500 font-medium">
              Consulting as <span className="text-violet-400 font-semibold">{activeProfileName}</span>
            </p>
          )}
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear this conversation history?')) {
                onClearHistory();
              }
            }}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>
        )}
      </div>

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
                    className="p-3 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 rounded-2xl text-left text-xs font-medium text-slate-300 hover:text-slate-100 transition group flex items-start justify-between"
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
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
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

                    {/* Speech Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm text-left shadow-lg ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-indigo-500/5'
                          : 'bg-slate-900 border border-slate-800/80 text-slate-200 leading-relaxed shadow-slate-950/20'
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[10px] text-right mt-1.5 opacity-50 font-medium">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pipeline / Loading State */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-start space-x-3 w-full max-w-[85%]">
                  <div className="p-2.5 rounded-xl border shrink-0 bg-slate-900 border-slate-800 text-violet-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
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
      <div className="p-6 bg-slate-900/30 border-t border-slate-800/80 backdrop-blur-md z-10">
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
    </div>
  );
};
