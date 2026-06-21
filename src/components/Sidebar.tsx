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
  ragLlmResponse: number;                     // New prop for RAG LLM response limit
  onSetRagLlmResponse: (val: number) => void;
  ragRecommendations: number;
  onSetRagRecommendations: (val: number) => void;
  ragAugmentation: number;
  onSetRagAugmentation: (val: number) => void;
  
  cfCandidates: number;
  onSetCfCandidates: (val: number) => void;
  cfLlmResponse: number;                      // New prop for CF LLM response limit
  onSetCfLlmResponse: (val: number) => void;
  cfRecommendations: number;
  onSetCfRecommendations: (val: number) => void;
  cfAugmentation: number;
  onSetCfAugmentation: (val: number) => void;
  cfKUsers: number;
  onSetCfKUsers: (val: number) => void;
  cfMinRating: number;
  onSetCfMinRating: (val: number) => void;

  ratingsCount: number; // Current interaction count
}

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 
  'Thriller', 'Horror', 'Romance', 'Fantasy', 'Mystery', 
  'Crime', 'Animation', 'Documentary', 'Suspense'
];

interface HoverHelp {
  title: string;
  explanation: string;
  lower: string;
  higher: string;
  rect: DOMRect;
}

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
  ragLlmResponse,
  onSetRagLlmResponse,
  ragRecommendations,
  onSetRagRecommendations,
  ragAugmentation,
  onSetRagAugmentation,
  cfCandidates,
  onSetCfCandidates,
  cfLlmResponse,
  onSetCfLlmResponse,
  cfRecommendations,
  onSetCfRecommendations,
  cfAugmentation,
  onSetCfAugmentation,
  cfKUsers,
  onSetCfKUsers,
  cfMinRating,
  onSetCfMinRating,

  ratingsCount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverHelp, setHoverHelp] = useState<HoverHelp | null>(null);
  
  const isWarmStart = ratingsCount >= 20;

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

  const showHelp = (e: React.MouseEvent, title: string, explanation: string, lower: string, higher: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverHelp({
      title,
      explanation,
      lower,
      higher,
      rect,
    });
  };

  const hideHelp = () => {
    setHoverHelp(null);
  };

  // Helper to render interactive info triggers with fixed tooltip behavior
  const renderInfoTrigger = (title: string, explanation: string, lower: string, higher: string) => (
    <span
      onMouseEnter={(e) => showHelp(e, title, explanation, lower, higher)}
      onMouseLeave={hideHelp}
      className="ml-1.5 p-0.5 rounded text-slate-500 hover:text-violet-400 cursor-help transition inline-block align-middle"
    >
      <Info className="w-3.5 h-3.5" />
    </span>
  );

  // Viewport Collision-Aware Tooltip Positioning Algorithm (Increased height bounds to prevent scrollbars)
  const calculateTooltipStyles = (rect: DOMRect | null) => {
    if (!rect) return {};

    const tooltipWidth = 320;
    const tooltipHeight = 420; // Increased to 420px to prevent scrollbars completely
    const margin = 12;

    // 1. Horizontal Placement (Right is preferred, fallback to left)
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
              onMouseEnter={(e) => showHelp(e, "Registrar Nuevo Perfil", "Permite crear un nuevo usuario con preferencias de géneros y años de lanzamiento específicos en MongoDB para resolver el Inicio Frío (Cold-Start).", "Inicio frío absoluto por falta de datos.", "Ajuste preciso de las restricciones e intenciones del usuario.")}
              onMouseLeave={hideHelp}
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
                      onMouseEnter={(e) => showHelp(e, "Eliminar Perfil", "Purga de forma permanente este perfil de MongoDB, borrando todo su historial conversacional y sus calificaciones registradas.", "Se conserva el perfil en la base de datos.", "Wipe permanente del usuario y sus datos de skynet.")}
                      onMouseLeave={hideHelp}
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
            <span
              onMouseEnter={(e) => showHelp(e, "Modelo de Inferencia LLM", "Determina el Large Language Model (local en Ollama) que actuará como 'Juez de Contexto' jerarquizando y eligiendo las mejores recomendaciones.", "Gemma/Llama: Rápidos y estructurados.", "DeepSeek-R1: Razonamiento deductivo y lógico extenso.")}
              onMouseLeave={hideHelp}
              className="cursor-help hover:text-indigo-400 transition"
            >
              LLM Reasoning Model
            </span>
          </div>

          <div className="relative text-left">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition appearance-none cursor-pointer pr-10"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 border-l border-slate-800 pl-2 flex items-center h-4">
              <span className="text-[9px]">▼</span>
            </div>
          </div>
        </div>

        {/* Dynamic profile metadata summary */}
        {activeProfile && (
          <div
            onMouseEnter={(e) => showHelp(e, "Configuración del Perfil Activo", "Muestra los filtros duros (décadas y géneros preferidos) definidos en el perfil que guían la búsqueda semántica vectorizada, y el recuento actual de interacciones.", "Consulta abierta sin sesgo de preferencias.", "Recomendaciones acotadas a tu perfil específico.")}
            onMouseLeave={hideHelp}
            className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 text-left text-xs space-y-2 cursor-help hover:border-slate-700 transition"
          >
            <p className="font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-1">
              Active Preferences:
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500 font-medium">Release year:</span> &gt;={activeProfile.metadata?.preferred_movies?.release?.from || '1970'}
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500 font-medium">Total Ratings:</span> <span className={`font-bold ${isWarmStart ? 'text-emerald-400' : 'text-amber-500'}`}>{ratingsCount}</span>
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
                    {renderInfoTrigger(
                      'Include RAG Metadata',
                      'Habilita la inserción de métricas de similitud técnica por cada película y los registros (logs) del pipeline en tiempo real. Esencial para auditorías científicas e investigativas.',
                      'Inferencia del LLM ligeramente más rápida; no se capturan trazas detalladas en la consola de Insights.',
                      'Permite evaluar en tiempo real los coeficientes de similitud coseno, los registros internos de llamadas y el prompt del LLM.'
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => onToggleMetadata(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-800 bg-slate-950 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer animate-in duration-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Filter out Seen Movies
                    {renderInfoTrigger(
                      'Filter out Seen Movies',
                      'Activa un filtro duro que evita que la base de datos de búsqueda semántica (RAG) o el Filtrado Colaborativo recuperen películas que el usuario activo ya haya calificado o visto en su historial.',
                      'Permite recomendar películas ya valoradas, ideal para re-evaluar la precisión histórica del recomendador.',
                      'Garantiza la serendipia pura y el descubrimiento de nuevo contenido no explorado previamente por el perfil.'
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={excludeSeen}
                    onChange={(e) => onToggleExcludeSeen(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-800 bg-slate-950 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* LLM Retry slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    LLM Max Retries
                    {renderInfoTrigger(
                      'LLM Max Retries',
                      'Establece la cantidad de reintentos de llamada que hará el sistema si el modelo local en Ollama falla, devuelve texto truncado o genera una respuesta que viola el esquema de validación JSON de Pydantic.',
                      'Menor tolerancia a fallos de formato, pero reduce el tiempo máximo de espera si el servidor está sobrecargado.',
                      'Asegura la entrega de recomendaciones estables y estructuradas forzando la regeneración del JSON si es inestable.'
                    )}
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
              </div>
            </div>

            {/* RAG Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RAG Pipeline (Cold-Start)</span>
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                  !isWarmStart 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-950 border-slate-855 text-slate-500'
                }`}>
                  {!isWarmStart ? '🟢 Active' : '⚪ Inactive'}
                </span>
              </div>

              <div className={isWarmStart ? 'opacity-40 select-none' : ''}>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Candidates Retrieval Limit
                        {renderInfoTrigger(
                          'Candidates Retrieval Limit (RAG)',
                          'Determina la cantidad de películas candidatas iniciales recuperadas por ChromaDB usando la menor distancia coseno respecto a la búsqueda textual del usuario. Estos candidatos actúan como el contexto inyectado al LLM.',
                          'Inferencia del LLM ultra rápida (menor contexto), pero arriesga omitir películas semánticamente valiosas para el usuario.',
                          'Búsqueda sumamente exhaustiva. Otorga mayor riqueza y variedad de candidatos al LLM a costo de mayor latencia.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragCandidates}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      disabled={isWarmStart}
                      value={ragCandidates}
                      onChange={(e) => onSetRagCandidates(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* NEW SLIDER: LLM Max Generation Limit */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        LLM Max Generation Limit (llm_response_limit)
                        {renderInfoTrigger(
                          'LLM Max Generation Limit',
                          'Indica el valor de llm_response_limit que se inyecta directamente en la instrucción del prompt del LLM (ej. "Recommend up to {X} movies"). Alterar este valor cambia el texto del prompt, rompiendo el caché y forzando inferencias reales de Ollama.',
                          'Instrucción compacta en el prompt. Ollama genera menos candidatos textuales, acelerando el proceso.',
                          'Instrucción extendida. Ollama genera más candidatos textuales enriqueciendo las opciones.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragLlmResponse}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={isWarmStart}
                      value={ragLlmResponse}
                      onChange={(e) => onSetRagLlmResponse(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Final Recommendations Limit (recommendations_limit)
                        {renderInfoTrigger(
                          'Final Recommendations Limit',
                          'Es el límite que toma tu recommendations_factory en el backend para recortar y truncar la respuesta final JSON enviada. Si es menor al límite de generación del LLM, permite podar resultados de manera programática.',
                          'Salida del JSON final extremadamente compacta.',
                          'Salida del JSON final extendida con más películas.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragRecommendations}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={isWarmStart}
                      value={ragRecommendations}
                      onChange={(e) => onSetRagRecommendations(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Diversity Augmentation
                        {renderInfoTrigger(
                          'Diversity Augmentation (RAG)',
                          'Cantidad de películas semánticamente similares (calculadas por ChromaDB) que el sistema añade de forma automática al final de las elegidas por el LLM. Funciona como una red de seguridad contra sesgos.',
                          'Resultados puros decididos por el LLM; sin red de seguridad colateral de diversidad.',
                          'Inyecta variedad colateral de forma matemática, garantizando que el usuario reciba un catálogo más amplio.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragAugmentation}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      disabled={isWarmStart}
                      value={ragAugmentation}
                      onChange={(e) => onSetRagAugmentation(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Collaborative Filtering Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Collaborative Filtering (Warm)</span>
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                  isWarmStart 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse' 
                    : 'bg-slate-950 border-slate-855 text-slate-500'
                }`}>
                  {isWarmStart ? '🟢 Active' : '🔒 Locked'}
                </span>
              </div>

              {!isWarmStart ? (
                /* Beautiful gamified locks banner for Cold-Start */
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-3.5 text-[10.5px] text-amber-400/90 font-medium leading-relaxed font-sans select-none animate-in fade-in duration-300">
                  🔒 <strong>Locked (Cold-Start Mode):</strong> Requires at least <strong>20 ratings</strong> in MongoDB to unlock Collaborative Filtering. 
                  <div className="mt-1.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-855/40 flex justify-between items-center text-[10px]">
                    <span>Current User Ratings:</span>
                    <span className="font-bold text-amber-500">{ratingsCount} / 20</span>
                  </div>
                </div>
              ) : (
                /* Unlocked banner */
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3.5 text-[10.5px] text-emerald-400/90 font-medium leading-relaxed font-sans select-none animate-in fade-in duration-300">
                  🔓 <strong>Active (Warm-Start Mode):</strong> Profile successfully warm-started! Adjust neural similarity and collaborative predictions weights below.
                </div>
              )}

              <div className={!isWarmStart ? 'opacity-30 select-none' : ''}>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        CF Candidate Limit
                        {renderInfoTrigger(
                          'CF Candidate Limit',
                          'Límite de películas candidatas extraídas del Filtrado Colaborativo. Este motor busca patrones de calificaciones cruzadas de otros usuarios MongoDB con perfiles de votación afines al tuyo.',
                          'Inferencia muy rápida, pero puede excluir opciones colaborativas de nicho o sorpresas agradables.',
                          'Proporciona un catálogo de opciones más ricas al LLM para su jerarquización semántica.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfCandidates}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      disabled={!isWarmStart}
                      value={cfCandidates}
                      onChange={(e) => onSetCfCandidates(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* NEW SLIDER: CF LLM Max Generation Limit */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        CF LLM Generation Limit (llm_response_limit)
                        {renderInfoTrigger(
                          'CF LLM Generation Limit',
                          'Configura el llm_response_limit inyectado directamente en el prompt colaborativo del LLM, instruyendo la cantidad máxima de recomendaciones textuales a generar.',
                          'Ollama genera menos textos, acelerando radicalmente la inferencia.',
                          'Ollama genera un bloque de texto final más numeroso.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfLlmResponse}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={!isWarmStart}
                      value={cfLlmResponse}
                      onChange={(e) => onSetCfLlmResponse(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400">
                        CF Final Recommendations Limit (recommendations_limit)
                        {renderInfoTrigger(
                          'CF Final Recommendations Limit',
                          'Límite de películas colaborativas finales que el LLM filtrará e incluirá en la respuesta final JSON truncada.',
                          'Salida final muy recortada y directa.',
                          'Salida final extendida.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfRecommendations}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={!isWarmStart}
                      value={cfRecommendations}
                      onChange={(e) => onSetCfRecommendations(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400">
                        CF Diversity Augmentation
                        {renderInfoTrigger(
                          'CF Diversity Augmentation',
                          'Cantidad de películas similares que se añaden al resultado colaborativo final para incentivar el descubrimiento (serendipity), evitando que el recomendador encasille al usuario en un catálogo de nicho cerrado.',
                          'La lista final depende estrictamente de las predicciones del modelo CF.',
                          'Inyecta variedad colateral, mitigando el sesgo de popularidad del filtro colaborativo.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfAugmentation}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      disabled={!isWarmStart}
                      value={cfAugmentation}
                      onChange={(e) => onSetCfAugmentation(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400">
                        K-Nearest Neighbors
                        {renderInfoTrigger(
                          'K-Nearest Neighbors (k)',
                          'Establece el número de usuarios más similares ($k$) en la base de datos MongoDB que se tomarán en cuenta para construir el vector de predicciones colaborativas.',
                          'Especialización radical. Las recomendaciones se basan en los gustos exactos de un grupo diminuto de usuarios afines.',
                          'Generalización amplia. Promedia los gustos de un espectro más grande de usuarios similares, suavizando extremos.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfKUsers} users</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={!isWarmStart}
                      value={cfKUsers}
                      onChange={(e) => onSetCfKUsers(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400">
                        Min Rating Threshold
                        {renderInfoTrigger(
                          'Min Rating Threshold',
                          'Filtra previamente cualquier película candidata cuya calificación promedio dentro de tu grupo de usuarios afines no alcance este valor mínimo de estrellas.',
                          'Mayor tolerancia; permite que entren al LLM candidatos controversiales o de nicho.',
                          'Filtro de calidad muy exigente; solo ingresan películas con valoraciones excelentes entre tus vecinos afines.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfMinRating.toFixed(1)} ★</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      disabled={!isWarmStart}
                      value={cfMinRating}
                      onChange={(e) => onSetCfMinRating(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Create User Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
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
    </aside>
  );
};
