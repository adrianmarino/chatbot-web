import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatFeed } from './components/ChatFeed';
import type { ChatMessage } from './components/ChatFeed';
import { DeveloperPanel } from './components/DeveloperPanel';
import { api } from './services/api';
import type { UserProfile, Recommendation, RecommendationsMetadata } from './services/api';
import { Loader2, Film } from 'lucide-react';

function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('chatbot_selected_model') || 'gemma3:4b';
  });
  
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [excludeSeen, setExcludeSeen] = useState(true);
  
  // Hyperparameters
  const [retry, setRetry] = useState(2);
  const [ragCandidates, setRagCandidates] = useState(20);
  const [ragLlmResponse, setRagLlmResponse] = useState(20); // LLM Generation Limit state
  const [ragRecommendations, setRagRecommendations] = useState(5);
  const [ragAugmentation, setRagAugmentation] = useState(5);
  
  const [cfCandidates, setCfCandidates] = useState(20);
  const [cfLlmResponse, setCfLlmResponse] = useState(20); // CF LLM Generation Limit state
  const [cfRecommendations, setCfRecommendations] = useState(5);
  const [cfAugmentation, setCfAugmentation] = useState(5);
  const [cfKUsers, setCfKUsers] = useState(5);
  const [cfMinRating, setCfMinRating] = useState(3.5);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState<RecommendationsMetadata | null>(null);
  
  const [ratedMovies, setRatedMovies] = useState<Record<string, number>>({});
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Left sidebar collapsible state
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null); // Active audited message ID
  const [activeCurl, setActiveCurl] = useState<string>(''); // Active audited CURL command
  const [activeRawResponse, setActiveRawResponse] = useState<any>(null); // Active raw API response
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
        
        // If current selected model is not in the loaded models list, select a fallback
        setSelectedModel((prev) => {
          if (loadedModels.includes(prev)) {
            return prev;
          }
          const gemmaModel = loadedModels.find((m) => m.toLowerCase().includes('gemma'));
          if (gemmaModel) return gemmaModel;
          if (loadedModels.includes('deepseek-r1:8b')) return 'deepseek-r1:8b';
          if (loadedModels.includes('llama3:latest')) return 'llama3:latest';
          return loadedModels.length > 0 ? loadedModels[0] : prev;
        });
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setAppInitializing(false);
      }
    }
    init();
  }, []);

  // Save selected model choice
  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('chatbot_selected_model', selectedModel);
    }
  }, [selectedModel]);

  // When active profile changes: load their interactions and chat history
  useEffect(() => {
    if (!activeProfile) {
      setMessages([]);
      setMeta(null);
      setSelectedMessageId(null);
      setActiveCurl('');
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

      setMeta(null);
      setSelectedMessageId(null);
      setActiveCurl('');
      setActiveRawResponse(null);
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
      setMeta(null);
      setSelectedMessageId(null);
      setActiveCurl('');
      setActiveRawResponse(null);
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
      const queryPayload = {
        message: {
          author: activeProfile.email,
          content: text,
        },
        settings: {
          llm: selectedModel,
          retry: retry,
          include_metadata: includeMetadata,
          rag: {
            candidates_limit: ragCandidates,
            llm_response_limit: ragLlmResponse,           // Mapped to change prompt text & break cache!
            recommendations_limit: ragRecommendations,    // Truncates response in factory
            similar_items_augmentation_limit: ragAugmentation,
            not_seen: excludeSeen,
          },
          collaborative_filtering: {
            candidates_limit: cfCandidates,
            llm_response_limit: cfLlmResponse,           // Mapped to change prompt text & break cache!
            recommendations_limit: cfRecommendations,     // Truncates response in factory
            similar_items_augmentation_limit: cfAugmentation,
            not_seen: excludeSeen,
            k_sim_users: cfKUsers,
            min_rating_by_user: cfMinRating,
          },
        },
      };

      // Generate exact copyable, bash-safe CURL request string
      const apiHost = import.meta.env.VITE_API_URL || 'http://nonosoft.ddns.net:8080';
      const curlUrl = `${apiHost}/api/v1/recommendations`;
      const escapedBody = JSON.stringify(queryPayload, null, 2).replace(/'/g, "'\\''");
      const curlStr = `curl -X POST "${curlUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${escapedBody}'`;

      const response = await api.askRecommendation(queryPayload);

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: '', // Removed generic response text, rendering recommendations grid directly!
          timestamp: new Date(),
          recommendations: response.items, // Embed recommendations directly into this chat message
          queryText: text, // Embed the exact prompt query text so it can be re-sent on demand!
          metadata: response.metadata || null, // Store metadata inside the message bubble!
          curlCommand: curlStr, // Store CURL command string!
          rawApiResponse: response, // Store raw API JSON!
        },
      ]);

      if (response.metadata) {
        setMeta(response.metadata);
      }
      setSelectedMessageId(botMsgId); // Auto-select the newly generated message bubble!
      setActiveCurl(curlStr); // Set the active CURL command!
      setActiveRawResponse(response); // Set the active raw API response!
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

  const handleSelectMessage = (id: string, metadata: RecommendationsMetadata | null, curlCommand: string, rawApiResponse?: any) => {
    setSelectedMessageId(id);
    setMeta(metadata);
    setActiveCurl(curlCommand); // Dynamically update active audited CURL command!
    setActiveRawResponse(rawApiResponse || null);
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
      {/* 1. Collapsible Sidebar Panel */}
      {isSidebarOpen && (
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
          
          retry={retry}
          onSetRetry={setRetry}
          ragCandidates={ragCandidates}
          onSetRagCandidates={setRagCandidates}
          ragLlmResponse={ragLlmResponse}
          onSetRagLlmResponse={setRagLlmResponse}
          ragRecommendations={ragRecommendations}
          onSetRagRecommendations={setRagRecommendations}
          ragAugmentation={ragAugmentation}
          onSetRagAugmentation={setRagAugmentation}
          cfCandidates={cfCandidates}
          onSetCfCandidates={setCfCandidates}
          cfLlmResponse={cfLlmResponse}
          onSetCfLlmResponse={setCfLlmResponse}
          cfRecommendations={cfRecommendations}
          onSetCfRecommendations={setCfRecommendations}
          cfAugmentation={cfAugmentation}
          onSetCfAugmentation={setCfAugmentation}
          cfKUsers={cfKUsers}
          onSetCfKUsers={setCfKUsers}
          cfMinRating={cfMinRating}
          onSetCfMinRating={setCfMinRating}

          ratingsCount={Object.keys(ratedMovies).length} // Pass the ratings count to sidebar!
        />
      )}

      {/* 2. Main Interface Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProfile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversational Chat Feed with Inline MovieGrid */}
            <ChatFeed
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearHistory={handleClearHistory}
              isLoading={isLoading}
              activeProfileName={activeProfile?.name}
              activeProfileEmail={activeProfile?.email}
              onRateMovie={handleRateMovie}
              ratedMovies={ratedMovies}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              selectedMessageId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
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
          curlCommand={activeCurl} // Pass down the audited curl command string
          rawApiResponse={activeRawResponse} // Pass down the raw API response
        />
      )}
    </div>
  );
}

export default App;
