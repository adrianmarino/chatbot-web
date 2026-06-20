import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatFeed } from './components/ChatFeed';
import type { ChatMessage } from './components/ChatFeed';
import { MovieGrid } from './components/MovieGrid';
import { DeveloperPanel } from './components/DeveloperPanel';
import { api } from './services/api';
import type { UserProfile, Recommendation, RecommendationsMetadata } from './services/api';
import { Loader2, Film } from 'lucide-react';

function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3:latest');
  
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [excludeSeen, setExcludeSeen] = useState(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [meta, setMeta] = useState<RecommendationsMetadata | null>(null);
  
  const [ratedMovies, setRatedMovies] = useState<Record<string, number>>({});
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(true);
  const [appInitializing, setAppInitializing] = useState(true);

  // Initialize: load profiles and models
  useEffect(() => {
    async function init() {
      try {
        const loadedProfiles = await api.getProfiles();
        setProfiles(loadedProfiles);
        
        // Select last active or first profile
        const savedEmail = localStorage.getItem('chatbot_active_email');
        const found = loadedProfiles.find((p) => p.email === savedEmail);
        if (found) {
          setActiveProfile(found);
        } else if (loadedProfiles.length > 0) {
          setActiveProfile(loadedProfiles[0]);
        }

        const loadedModels = await api.getAvailableModels();
        setModels(loadedModels);
        
        // Set default model preference
        if (loadedModels.includes('deepseek-r1:8b')) {
          setSelectedModel('deepseek-r1:8b');
        } else if (loadedModels.includes('llama3:latest')) {
          setSelectedModel('llama3:latest');
        } else if (loadedModels.length > 0) {
          setSelectedModel(loadedModels[0]);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setAppInitializing(false);
      }
    }
    init();
  }, []);

  // When active profile changes: load their interactions and chat history
  useEffect(() => {
    if (!activeProfile) {
      setMessages([]);
      setRecommendations([]);
      setMeta(null);
      setRatedMovies({});
      return;
    }

    const email = activeProfile.email;

    // Save profile choice
    localStorage.setItem('chatbot_active_email', email);

    async function loadProfileContext() {
      // 1. Fetch user's explicit movie ratings (Interactions)
      try {
        const ratingsList = await api.getUserInteractions(email);
        const ratingsMap: Record<string, number> = {};
        ratingsList.forEach((r) => {
          ratingsMap[r.item_id] = r.rating;
        });
        setRatedMovies(ratingsMap);
      } catch (err) {
        console.warn('Could not load interactions for profile:', err);
        setRatedMovies({});
      }

      // 2. Fetch history
      try {
        const chatHist = await api.getHistory(email);
        if (chatHist && Array.isArray(chatHist.history)) {
          const formatted: ChatMessage[] = [];
          chatHist.history.forEach((h: any, i: number) => {
            if (h.user) {
              formatted.push({
                id: `hist-user-${i}`,
                sender: 'user',
                text: h.user,
                timestamp: new Date(),
              });
            }
            if (h.bot) {
              formatted.push({
                id: `hist-bot-${i}`,
                sender: 'bot',
                text: h.bot,
                timestamp: new Date(),
              });
            }
          });
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.warn('Could not load chat history for profile:', err);
        setMessages([]);
      }

      // Clear old recommendations on profile swap
      setRecommendations([]);
      setMeta(null);
    }

    loadProfileContext();
  }, [activeProfile]);

  const handleSelectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
  };

  const handleCreateProfile = async (newProfile: UserProfile) => {
    await api.createProfile(newProfile);
    const updated = await api.getProfiles();
    setProfiles(updated);
    // Auto-select the newly created profile
    const created = updated.find((p) => p.email === newProfile.email);
    if (created) {
      setActiveProfile(created);
    }
  };

  const handleDeleteProfile = async (email: string) => {
    await api.deleteProfile(email);
    const updated = await api.getProfiles();
    setProfiles(updated);
    if (activeProfile?.email === email) {
      if (updated.length > 0) {
        setActiveProfile(updated[0]);
      } else {
        setActiveProfile(null);
      }
    }
  };

  const handleClearHistory = async () => {
    if (!activeProfile) return;
    try {
      await api.deleteHistory(activeProfile.email);
      setMessages([]);
      setRecommendations([]);
      setMeta(null);
    } catch (err) {
      console.error('Error clearing history:', err);
      alert('Failed to reset history.');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeProfile || isLoading) return;

    const userMsgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await api.askRecommendation({
        message: {
          author: activeProfile.email,
          content: text,
        },
        settings: {
          llm: selectedModel,
          include_metadata: includeMetadata,
          rag: {
            not_seen: excludeSeen,
          },
          collaborative_filtering: {
            not_seen: excludeSeen,
          },
        },
      });

      // Find text content
      let botResponseText = 'Here are some custom movie recommendations for you:';
      if (response.metadata?.response?.content) {
        // If DeepSeek-R1, we might strip out the thinking tags to keep the main chat clean
        const rawContent = response.metadata.response.content;
        botResponseText = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponseText,
          timestamp: new Date(),
        },
      ]);

      setRecommendations(response.items);
      if (response.metadata) {
        setMeta(response.metadata);
      }
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Error connecting to server: ${err.message || 'Unknown issue'}. Please verify connection to skynet.`,
          timestamp: new Date(),
          status: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateMovie = async (movie: Recommendation, rating: number) => {
    if (!activeProfile) return;
    const movieId = movie.metadata?.db_item?.id || movie.title;
    
    // Optimistic UI update
    setRatedMovies((prev) => ({
      ...prev,
      [movieId]: rating,
    }));

    try {
      await api.addInteraction({
        user_id: activeProfile.email,
        item_id: movieId,
        rating,
      });
    } catch (err) {
      console.error('Error rating movie:', err);
      // Revert on error
      setRatedMovies((prev) => {
        const copy = { ...prev };
        delete copy[movieId];
        return copy;
      });
      throw err;
    }
  };

  if (appInitializing) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 font-sans space-y-4">
        <div className="p-4 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/10">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Chatbot Web Console
          </h2>
          <p className="text-xs text-slate-500 font-medium">Connecting to skynet backend services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Sidebar Panel */}
      <Sidebar
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        includeMetadata={includeMetadata}
        onToggleMetadata={setIncludeMetadata}
        excludeSeen={excludeSeen}
        onToggleExcludeSeen={setExcludeSeen}
      />

      {/* 2. Main Interface Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProfile ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Upper: Chat Conversation Feed */}
            <div className="flex-1 min-h-[400px]">
              <ChatFeed
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearHistory={handleClearHistory}
                isLoading={isLoading}
                activeProfileName={activeProfile?.name}
              />
            </div>
            
            {/* Lower: Recommendations Movie Grid */}
            <MovieGrid
              movies={recommendations}
              onRateMovie={handleRateMovie}
              ratedMovies={ratedMovies}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              <Film className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold">No active profiles</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Please create or select a user profile in the sidebar to start asking questions to the recommendation engine.
            </p>
          </div>
        )}
      </div>

      {/* 3. Research Drawer / Insights Console */}
      {activeProfile && (
        <DeveloperPanel
          metadata={meta}
          isOpen={isDevPanelOpen}
          onToggle={() => setIsDevPanelOpen(!isDevPanelOpen)}
        />
      )}
    </div>
  );
}

export default App;
