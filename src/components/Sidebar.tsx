import React, { useState } from 'react';
import { User, Plus, Settings, Bot, Sparkles, Trash2, Filter, Sliders, Database, Users, Info } from 'lucide-react';
import type { UserProfile } from '../services/api';

interface SidebarProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (profile: UserProfile) => void;
  onCreateProfile: (profile: UserProfile) => Promise<void>;
  onDeleteProfile: (email: string) => Promise<void>;
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  
  // Settings values and handlers
  includeMetadata: boolean;
  onToggleMetadata: (val: boolean) => void;
  excludeSeen: boolean;
  onToggleExcludeSeen: (val: boolean) => void;
  
  // Pipeline hyperparameters
  retry: number;
  onSetRetry: (val: number) => void;
  
  ragCandidates: number;
  onSetRagCandidates: (val: number) => void;
  ragRecommendations: number;
  onSetRagRecommendations: (val: number) => void;
  ragAugmentation: number;
  onSetRagAugmentation: (val: number) => void;
  
  cfCandidates: number;
  onSetCfCandidates: (val: number) => void;
  cfRecommendations: number;
  onSetCfRecommendations: (val: number) => void;
  cfAugmentation: number;
  onSetCfAugmentation: (val: number) => void;
  cfKUsers: number;
  onSetCfKUsers: (val: number) => void;
  cfMinRating: number;
  onSetCfMinRating: (val: number) => void;
}

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 
  'Thriller', 'Horror', 'Romance', 'Fantasy', 'Mystery', 
  'Crime', 'Animation', 'Documentary', 'Suspense'
];

export const Sidebar: React.FC<SidebarProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  models,
  selectedModel,
  onSelectModel,
  includeMetadata,
  onToggleMetadata,
  excludeSeen,
  onToggleExcludeSeen,
  
  retry,
  onSetRetry,
  ragCandidates,
  onSetRagCandidates,
  ragRecommendations,
  onSetRagRecommendations,
  ragAugmentation,
  onSetRagAugmentation,
  cfCandidates,
  onSetCfCandidates,
  cfRecommendations,
  onSetCfRecommendations,
  cfAugmentation,
  onSetCfAugmentation,
  cfKUsers,
  onSetCfKUsers,
  cfMinRating,
  onSetCfMinRating,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  
  // New profile form state
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
      setIsModalOpen(false);
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

  const toggleHelp = (param: string) => {
    setActiveHelp(activeHelp === param ? null : param);
  };

  // Helper to render interactive info triggers
  const renderInfoTrigger = (param: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleHelp(param);
      }}
      className={`ml-1.5 p-0.5 rounded transition inline-block align-middle ${
        activeHelp === param ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-violet-400 hover:bg-slate-800'
      }`}
      title="Haga clic para ver explicación detallada"
    >
      <Info className="w-3.5 h-3.5" />
    </button>
  );

  // Helper to render expanded detailed inline card
  const renderHelpCard = (param: string, title: string, explanation: string, lowerImpact: string, higherImpact: string) => {
    if (activeHelp !== param) return null;
    return (
      <div className="mt-2 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-2 leading-relaxed animate-in slide-in-from-top-1.5 duration-200">
        <div className="font-bold text-slate-100 flex items-center space-x-1 border-b border-slate-800 pb-1">
          <span>💡</span>
          <span>{title}</span>
        </div>
        <p>{explanation}</p>
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-900">
          <div className="bg-slate-900/40 p-1.5 rounded-lg border border-slate-850/40">
            <span className="font-bold text-indigo-400 block mb-0.5">Valores Bajos:</span>
            {lowerImpact}
          </div>
          <div className="bg-slate-900/40 p-1.5 rounded-lg border border-slate-850/40">
            <span className="font-bold text-violet-400 block mb-0.5">Valores Altos:</span>
            {higherImpact}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen overflow-hidden shrink-0">
      {/* App Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-gradient-to-r from-violet-600/10 to-transparent shrink-0">
        <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Chatbot Web
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            HYBRID REC-SYS CONSOLE
          </p>
        </div>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Profile management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active User Profiles
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition"
              title="Create new profile"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {profiles.map((profile) => {
              const isActive = activeProfile?.email === profile.email;
              return (
                <div
                  key={profile.email}
                  onClick={() => onSelectProfile(profile)}
                  className={`group relative p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isActive
                      ? 'bg-violet-950/40 border-violet-500/40 shadow-lg shadow-violet-500/5 text-violet-200'
                      : 'bg-slate-950/20 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden text-left">
                    <div
                      className={`p-2 rounded-lg transition ${
                        isActive ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left truncate">
                      <p className="font-semibold text-sm truncate">{profile.name}</p>
                      <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                    </div>
                  </div>

                  {profiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete profile for ${profile.name}?`)) {
                          onDeleteProfile(profile.email);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition text-slate-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Section */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>LLM Reasoning Model</span>
          </div>

          <div className="relative text-left">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition appearance-none cursor-pointer"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-slate-400 border-l border-slate-800 pl-2">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* Dynamic profile metadata summary */}
        {activeProfile && (
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 text-left text-xs space-y-2">
            <p className="font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-1">
              Active Preferences:
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500 font-medium">Release year:</span> &gt;={activeProfile.metadata?.preferred_movies?.release?.from || '1970'}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(activeProfile.metadata?.preferred_movies?.genres || []).map((g) => (
                <span
                  key={g}
                  className="bg-slate-800/80 border border-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded-md text-[10px]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Settings Accordion (The Hyperparameter Tuning Dashboard!) */}
      <div className="border-t border-slate-800 bg-slate-950/20 max-h-[55vh] flex flex-col shrink-0">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 p-4 hover:bg-slate-800/20 transition text-sm font-semibold shrink-0"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-violet-400" />
            <span>Pipeline Hyperparameters</span>
          </div>
          <span>{showSettings ? '▲' : '▼'}</span>
        </button>

        {showSettings && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 text-left border-t border-slate-800/40 pt-3 shadow-inner">
            {/* Global Settings */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span>General Engine</span>
              </span>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Include RAG Metadata
                    {renderInfoTrigger('incMeta')}
                  </span>
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => onToggleMetadata(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-800 bg-slate-950 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer animate-in duration-100"
                  />
                </div>
                {renderHelpCard(
                  'incMeta',
                  'Include RAG Metadata',
                  'Habilita la inserción de métricas de similitud técnica por cada película y los registros (logs) del pipeline en tiempo real. Esencial para auditorías científicas.',
                  'Inferencia ligeramente más rápida; no se registran trazas en el Panel de Insights.',
                  'Permite evaluar las distancias vectoriales y el prompt del LLM en tiempo real.'
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Filter out Seen Movies
                    {renderInfoTrigger('exSeen')}
                  </span>
                  <input
                    type="checkbox"
                    checked={excludeSeen}
                    onChange={(e) => onToggleExcludeSeen(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-800 bg-slate-950 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                </div>
                {renderHelpCard(
                  'exSeen',
                  'Filter out Seen Movies',
                  'Activa un filtro duro que evita que la base de datos de búsqueda semántica (RAG) o colaborativa recupere películas que el usuario activo ya haya calificado o visto en su historial.',
                  'Permite recomendar películas ya valoradas (útil para re-evaluar la precisión).',
                  'Garantiza la serendipia y el descubrimiento de nuevo contenido no visto.'
                )}
              </div>

              {/* LLM Retry slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    LLM Max Retries
                    {renderInfoTrigger('retries')}
                  </span>
                  <span className="text-violet-400 font-bold">{retry}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={retry}
                  onChange={(e) => onSetRetry(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'retries',
                  'LLM Max Retries',
                  'Establece la cantidad de reintentos máximos permitidos al sistema en caso de que la respuesta generada por el LLM venga corrupta, incompleta o falle la validación JSON contra los esquemas de Pydantic.',
                  'Menor tolerancia a respuestas mal formateadas, pero reduce la latencia en caso de fallos del LLM.',
                  'Asegura la entrega de resultados estructurados estables ante salidas inestables del LLM.'
                )}
              </div>
            </div>

            {/* RAG Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>RAG Pipeline (Cold-Start)</span>
              </span>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Candidates Retrieval Limit
                    {renderInfoTrigger('ragCand')}
                  </span>
                  <span className="text-indigo-400 font-bold">{ragCandidates}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={ragCandidates}
                  onChange={(e) => onSetRagCandidates(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'ragCand',
                  'Candidates Retrieval Limit',
                  'Determina la cantidad de películas iniciales recuperadas por ChromaDB mediante la menor distancia coseno respecto a la búsqueda del usuario. Estos candidatos actúan como el contexto inyectado al LLM.',
                  'Inferencia del LLM extremadamente rápida, pero arriesga omitir coincidencias semánticas valiosas.',
                  'Búsqueda sumamente exhaustiva. Otorga mayor diversidad de contexto al LLM a costo de mayor latencia.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    LLM Recommendation Limit
                    {renderInfoTrigger('ragRec')}
                  </span>
                  <span className="text-indigo-400 font-bold">{ragRecommendations}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={ragRecommendations}
                  onChange={(e) => onSetRagRecommendations(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'ragRec',
                  'LLM Recommendation Limit',
                  'Número de películas elegidas y ordenadas finalmente por el LLM. El modelo evalúa cuáles de los candidatos inyectados responden con mayor precisión a tu prompt e historial.',
                  'Salida muy compacta y enfocada en los matches más evidentes.',
                  'Salida más extensa. Ideal para analizar la capacidad de discernimiento del LLM en espectros de contexto más amplios.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Diversity Augmentation
                    {renderInfoTrigger('ragAug')}
                  </span>
                  <span className="text-indigo-400 font-bold">{ragAugmentation}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={ragAugmentation}
                  onChange={(e) => onSetRagAugmentation(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'ragAug',
                  'Diversity Augmentation',
                  'Cantidad de películas similares a las elegidas por el LLM que se añaden directamente al final. Mitiga la potencial rigidez del filtro conceptual del LLM.',
                  'Resultados puramente decididos por el LLM; sin red de seguridad de diversidad.',
                  'Garantiza diversidad de recomendaciones acoplando ítems semánticamente afines calculados matemáticamente.'
                )}
              </div>
            </div>

            {/* Collaborative Filtering Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Collaborative Filtering (Warm)</span>
              </span>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    CF Candidate Limit
                    {renderInfoTrigger('cfCand')}
                  </span>
                  <span className="text-emerald-400 font-bold">{cfCandidates}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={cfCandidates}
                  onChange={(e) => onSetCfCandidates(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'cfCand',
                  'CF Candidate Limit',
                  'Límite de películas candidatas extraídas del Filtrado Colaborativo, calculadas a partir de la predicción de ratings ponderados de usuarios similares.',
                  'Se analizan pocas opciones; inferencia muy rápida, pero puede excluir sorpresas agradables.',
                  'Le proporciona un catálogo de opciones más ricas al LLM para su jerarquización semántica.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    CF LLM Recommendation Limit
                    {renderInfoTrigger('cfRec')}
                  </span>
                  <span className="text-emerald-400 font-bold">{cfRecommendations}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={cfRecommendations}
                  onChange={(e) => onSetCfRecommendations(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'cfRec',
                  'CF LLM Recommendation Limit',
                  'Límite máximo de recomendaciones colaborativas finales que el LLM filtrará e incluirá en la respuesta, garantizando que tengan sentido conceptual con tu prompt.',
                  'Resultados ultradepurados.',
                  'Incluye una mayor variedad de predicciones colaborativas evaluadas semánticamente.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    CF Diversity Augmentation
                    {renderInfoTrigger('cfAug')}
                  </span>
                  <span className="text-emerald-400 font-bold">{cfAugmentation}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={cfAugmentation}
                  onChange={(e) => onSetCfAugmentation(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'cfAug',
                  'CF Diversity Augmentation',
                  'Cantidad de películas similares que se añaden al resultado colaborativo final para incentivar la serendipia y evitar burbujas de recomendación cerradas.',
                  'La lista final depende estrictamente de las predicciones del modelo CF.',
                  'Inyecta variedad colateral, mitigando el sesgo de popularidad del filtro colaborativo.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    K-Nearest Neighbors
                    {renderInfoTrigger('cfK')}
                  </span>
                  <span className="text-emerald-400 font-bold">{cfKUsers} users</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={cfKUsers}
                  onChange={(e) => onSetCfKUsers(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'cfK',
                  'K-Nearest Neighbors',
                  'Establece el número de usuarios con gustos correlacionados ($k$) en MongoDB que se tomarán en cuenta para construir el vector de predicciones colaborativas.',
                  'Especialización radical. Las recomendaciones se basan en los gustos exactos de un grupo diminuto de usuarios afines.',
                  'Generalización amplia. Promedia los gustos de un espectro más grande de usuarios similares, suavizando extremos.'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Min Rating Threshold
                    {renderInfoTrigger('cfMin')}
                  </span>
                  <span className="text-emerald-400 font-bold">{cfMinRating.toFixed(1)} ★</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={cfMinRating}
                  onChange={(e) => onSetCfMinRating(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                {renderHelpCard(
                  'cfMin',
                  'Min Rating Threshold',
                  'Filtra previamente cualquier película candidata cuya calificación promedio dentro de tu grupo de usuarios afines no alcance este valor mínimo de estrellas.',
                  'Mayor tolerancia; permite que entren al LLM candidatos controversiales o de nicho.',
                  'Filtro de calidad muy exigente; solo ingresan películas con valoraciones excelentes entre tus vecinos afines.'
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Create User Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-violet-600/10 to-transparent flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <User className="w-5 h-5 text-violet-400" />
                <span>Create New User Profile</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </aside>
  );
};
