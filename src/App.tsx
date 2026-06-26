import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatFeed } from './components/ChatFeed';
import type { ChatMessage } from './components/ChatFeed';
import { DeveloperPanel } from './components/DeveloperPanel';
import { api } from './services/api';
import type { UserProfile, Recommendation, RecommendationsMetadata } from './services/api';
import { Loader2, Film, User, Filter } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (profile: UserProfile) => Promise<void>;
}

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 
  'Thriller', 'Horror', 'Romance', 'Fantasy', 'Mystery', 
  'Crime', 'Animation', 'Documentary', 'Suspense'
];

function CreateProfileModal({ isOpen, onClose, onCreateProfile }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(30);
  const [genre, setGenre] = useState('Male');
  const [nationality, setNationality] = useState('');
  const [work, setWork] = useState('');
  const [studies, setStudies] = useState('');
  const [releaseFrom, setReleaseFrom] = useState('1990');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenreToggle = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsSubmitting(true);
    try {
      const newProfile: UserProfile = {
        name,
        email,
        metadata: {
          studies,
          age: Number(age),
          genre,
          nationality,
          work,
          preferred_movies: {
            release: { from: releaseFrom },
            genres: selectedGenres.map((g) => g.toLowerCase()),
          },
        },
      };
      await onCreateProfile(newProfile);
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setAge(30);
      setGenre('Male');
      setNationality('');
      setWork('');
      setStudies('');
      setReleaseFrom('1990');
      setSelectedGenres([]);
    } catch (err) {
      console.error(err);
      alert('Failed to create profile. Ensure email is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-violet-600/10 to-transparent flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <User className="w-5 h-5 text-violet-400" />
            <span>Create New User Profile</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Gender</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Release Year From</label>
              <input
                type="text"
                value={releaseFrom}
                onChange={(e) => setReleaseFrom(e.target.value)}
                placeholder="1990"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Argentina"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Occupation</label>
              <input
                type="text"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Studies</label>
              <input
                type="text"
                value={studies}
                onChange={(e) => setStudies(e.target.value)}
                placeholder="Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs text-slate-400 font-medium flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Favorite Movie Genres</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl max-h-40 overflow-y-auto">
              {AVAILABLE_GENRES.map((g) => {
                const isChecked = selectedGenres.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => handleGenreToggle(g)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition truncate font-medium ${
                      isChecked
                        ? 'bg-violet-950/60 border-violet-500/60 text-violet-300 font-bold'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-semibold px-5 py-2 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('chatbot_selected_model') || 'gemma3:4b';
  });
  
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [excludeSeen, setExcludeSeen] = useState(true);
  const [ragShuffle, setRagShuffle] = useState(false);
  const [cfShuffle, setCfShuffle] = useState(false);
  
  // Hyperparameters
  const [retry, setRetry] = useState(2);
  const [ragCandidates, setRagCandidates] = useState(20);
  const [ragLlmResponse, setRagLlmResponse] = useState(20); // LLM Generation Limit state
  const [ragRecommendations, setRagRecommendations] = useState(5);
  const [ragAugmentation, setRagAugmentation] = useState(5);
  const [ragMinRating, setRagMinRating] = useState(0.0);
  
  const [cfCandidates, setCfCandidates] = useState(20);
  const [cfLlmResponse, setCfLlmResponse] = useState(20); // CF LLM Generation Limit state
  const [cfRecommendations, setCfRecommendations] = useState(5);
  const [cfAugmentation, setCfAugmentation] = useState(5);
  const [cfKUsers, setCfKUsers] = useState(20);
  const [cfMinRating, setCfMinRating] = useState(3.5);
  const [cfTextQueryLimit, setCfTextQueryLimit] = useState(5000);
  const [cfRandomSelectionItemsByUser, setCfRandomSelectionItemsByUser] = useState(1.0);
  const [cfMaxItemsByUser, setCfMaxItemsByUser] = useState(30);
  const [cfRankCriterion, setCfRankCriterion] = useState('user_sim_weighted_pred_rating_score');
  const [cfNeighborhoodExpansionRatio, setCfNeighborhoodExpansionRatio] = useState(1.5);
  const [cfMaxExpansionAttempts, setCfMaxExpansionAttempts] = useState(3);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState<RecommendationsMetadata | null>(null);
  
  const [ratedMovies, setRatedMovies] = useState<Record<string, number>>({});
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(() => {
    return localStorage.getItem('chatbot_dev_panel_open') !== 'false';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768); // Left sidebar collapsible state
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

  // Save dev panel open state
  useEffect(() => {
    localStorage.setItem('chatbot_dev_panel_open', String(isDevPanelOpen));
  }, [isDevPanelOpen]);

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
        if (chatHist && Array.isArray(chatHist.dialogue)) {
          const formatted: ChatMessage[] = [];
          chatHist.dialogue.forEach((msg: any, i: number) => {
            const isUser = msg.author !== 'AI';
            
            // Map past recommendations safely to ensure properties like genres and votes are always arrays
            const safeRecs = msg.metadata?.recommendations ? msg.metadata.recommendations.map((r: any) => ({
              title: r.title,
              description: r.description || '',
              release: r.release || '',
              genres: r.genres || [],
              votes: r.votes || [],
              poster: r.poster || null,
              metadata: r.metadata || null,
            })) : undefined;

            const hasRecs = safeRecs && safeRecs.length > 0;
            formatted.push({
              id: `hist-${isUser ? 'user' : 'bot'}-${i}`,
              sender: isUser ? 'user' : 'bot',
              text: isUser ? msg.content : (hasRecs ? msg.content : "No recommendations found."),
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(Date.now() - (chatHist.dialogue.length - i) * 5 * 60 * 1000),
              recommendations: safeRecs,
              metadata: msg.metadata || null,
              rawApiResponse: msg.metadata ? { 
                items: safeRecs || [], 
                metadata: msg.metadata 
              } : undefined,
            });
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

  const handleClearRatings = async () => {
    if (!activeProfile) return;
    try {
      await api.deleteUserInteractions(activeProfile.email);
      setRatedMovies({});
    } catch (err) {
      console.error('Error clearing ratings:', err);
      alert('Failed to clear ratings.');
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
            shuffle: ragShuffle,
            candidates_limit: ragCandidates,
            llm_response_limit: ragLlmResponse,           // Mapped to change prompt text & break cache!
            recommendations_limit: ragRecommendations,    // Truncates response in factory
            similar_items_augmentation_limit: ragAugmentation,
            not_seen: excludeSeen,
            min_rating_by_user: ragMinRating,
          },
          collaborative_filtering: {
            shuffle: cfShuffle,
            candidates_limit: cfCandidates,
            llm_response_limit: cfLlmResponse,           // Mapped to change prompt text & break cache!
            recommendations_limit: cfRecommendations,     // Truncates response in factory
            similar_items_augmentation_limit: cfAugmentation,
            not_seen: excludeSeen,
            k_sim_users: cfKUsers,
            min_rating_by_user: cfMinRating,
            text_query_limit: cfTextQueryLimit,
            random_selection_items_by_user: cfRandomSelectionItemsByUser,
            max_items_by_user: cfMaxItemsByUser,
            rank_criterion: cfRankCriterion,
            neighborhood_expansion_ratio: cfNeighborhoodExpansionRatio,
            max_expansion_attempts: cfMaxExpansionAttempts,
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
      const hasRecs = response.items && response.items.length > 0;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: hasRecs ? '' : "No recommendations found.",
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
      let text = `⚠️ Error connecting to server: ${err.message || 'Unknown issue'}. Please verify connection to skynet.`;
      if (err.response?.data?.msg) {
        text = `⚠️ Error: ${err.response.data.msg}`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text,
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
    <div className="h-[100dvh] w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Collapsible Sidebar Panel */}
      <Sidebar
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onOpenCreateProfileModal={() => setIsCreateProfileModalOpen(true)}
        onDeleteProfile={handleDeleteProfile}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        includeMetadata={includeMetadata}
        onToggleMetadata={setIncludeMetadata}
        excludeSeen={excludeSeen}
        onToggleExcludeSeen={setExcludeSeen}
        ragShuffle={ragShuffle}
        onToggleRagShuffle={setRagShuffle}
        cfShuffle={cfShuffle}
        onToggleCfShuffle={setCfShuffle}
        
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
        cfTextQueryLimit={cfTextQueryLimit}
        onSetCfTextQueryLimit={setCfTextQueryLimit}
        cfRandomSelectionItemsByUser={cfRandomSelectionItemsByUser}
        onSetCfRandomSelectionItemsByUser={setCfRandomSelectionItemsByUser}
        cfMaxItemsByUser={cfMaxItemsByUser}
        onSetCfMaxItemsByUser={setCfMaxItemsByUser}
        cfRankCriterion={cfRankCriterion}
        onSetCfRankCriterion={setCfRankCriterion}
        cfNeighborhoodExpansionRatio={cfNeighborhoodExpansionRatio}
        onSetCfNeighborhoodExpansionRatio={setCfNeighborhoodExpansionRatio}
        cfMaxExpansionAttempts={cfMaxExpansionAttempts}
        onSetCfMaxExpansionAttempts={setCfMaxExpansionAttempts}
        ragMinRating={ragMinRating}
        onSetRagMinRating={setRagMinRating}

        ratingsCount={Object.keys(ratedMovies).length} // Pass the ratings count to sidebar!
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 cursor-pointer"
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
              onClearRatings={handleClearRatings}
              isLoading={isLoading}
              activeProfileName={activeProfile?.name}
              activeProfileEmail={activeProfile?.email}
              onRateMovie={handleRateMovie}
              ratedMovies={ratedMovies}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              selectedMessageId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
              activeMetadata={meta}
              activeCurl={activeCurl}
              activeRawResponse={activeRawResponse}
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

      {/* 4. Global Modal - Create User Profile */}
      <CreateProfileModal
        isOpen={isCreateProfileModalOpen}
        onClose={() => setIsCreateProfileModalOpen(false)}
        onCreateProfile={handleCreateProfile}
      />
    </div>
  );
}

export default App;
