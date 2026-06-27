import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Plus, Settings, Bot, Sparkles, Trash2, Sliders, Database, Users, Info, Save, Download, Upload, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { UserProfile } from '../services/api';


export interface SavedSettingsProfile {
  name: string;
  selectedModel: string;
  includeMetadata: boolean;
  excludeSeen: boolean;
  retry: number;
  ragCandidates: number;
  ragLlmResponse: number;
  ragRecommendations: number;
  ragAugmentation: number;
  ragMinRating: number;
  cfCandidates: number;
  cfLlmResponse: number;
  cfRecommendations: number;
  cfAugmentation: number;
  cfKUsers: number;
  cfMinRating: number;
  cfTextQueryLimit: number;
  cfRandomSelectionItemsByUser: number;
  cfMaxItemsByUser: number;
  cfRankCriterion: string;
  cfNeighborhoodExpansionRatio: number;
  cfMaxExpansionAttempts: number;
  ragShuffle?: boolean;
  cfShuffle?: boolean;
}

interface SidebarProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (profile: UserProfile) => void;
  onOpenCreateProfileModal: () => void;
  onDeleteProfile: (email: string) => Promise<void>;
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  
  // Settings values and handlers
  includeMetadata: boolean;
  onToggleMetadata: (val: boolean) => void;
  excludeSeen: boolean;
  onToggleExcludeSeen: (val: boolean) => void;
  ragShuffle: boolean;
  onToggleRagShuffle: (val: boolean) => void;
  cfShuffle: boolean;
  onToggleCfShuffle: (val: boolean) => void;
  
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
  cfTextQueryLimit: number;
  onSetCfTextQueryLimit: (val: number) => void;
  cfRandomSelectionItemsByUser: number;
  onSetCfRandomSelectionItemsByUser: (val: number) => void;
  cfMaxItemsByUser: number;
  onSetCfMaxItemsByUser: (val: number) => void;
  cfRankCriterion: string;
  onSetCfRankCriterion: (val: string) => void;
  cfNeighborhoodExpansionRatio: number;
  onSetCfNeighborhoodExpansionRatio: (val: number) => void;
  cfMaxExpansionAttempts: number;
  onSetCfMaxExpansionAttempts: (val: number) => void;
  ragMinRating: number;
  onSetRagMinRating: (val: number) => void;

  ratingsCount: number; // Current interaction count
  isOpen: boolean;      // Responsive mobile drawer state
  onClose: () => void;  // Responsive mobile drawer close handler
}



interface HoverHelp {
  title: string;
  explanation: string;
  lower: string;
  higher: string;
  rect: DOMRect;
}

interface TouchSafeRangeProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const TouchSafeRange: React.FC<TouchSafeRangeProps> = ({
  value,
  onChange,
  className,
  style,
  ...props
}) => {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const isVerticalRef = React.useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.pageX, y: touch.pageY };
    isVerticalRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
    if (!touchStartRef.current) return;
    if (isVerticalRef.current === null) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.pageX - touchStartRef.current.x);
      const dy = Math.abs(touch.pageY - touchStartRef.current.y);
      if (dx > 5 || dy > 5) {
        isVerticalRef.current = dy > dx;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    isVerticalRef.current = null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isVerticalRef.current === true) {
      e.preventDefault();
      e.target.value = String(value);
      return;
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      type="range"
      value={value}
      onChange={handleChange}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
      style={style}
      {...props}
    />
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onOpenCreateProfileModal,
  onDeleteProfile,
  models,
  selectedModel,
  onSelectModel,
  isOpen,
  onClose,
  includeMetadata,
  onToggleMetadata,
  excludeSeen,
  onToggleExcludeSeen,
  ragShuffle,
  onToggleRagShuffle,
  cfShuffle,
  onToggleCfShuffle,
  
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
  cfTextQueryLimit,
  onSetCfTextQueryLimit,
  cfRandomSelectionItemsByUser,
  onSetCfRandomSelectionItemsByUser,
  cfMaxItemsByUser,
  onSetCfMaxItemsByUser,
  cfRankCriterion,
  onSetCfRankCriterion,
  cfNeighborhoodExpansionRatio,
  onSetCfNeighborhoodExpansionRatio,
  cfMaxExpansionAttempts,
  onSetCfMaxExpansionAttempts,
  ragMinRating,
  onSetRagMinRating,

  ratingsCount,
}) => {

  const [showSettings, setShowSettings] = useState(() => {
    return localStorage.getItem('chatbot_show_settings') === 'true';
  });
  const [hoverHelp, setHoverHelp] = useState<HoverHelp | null>(null);

  const [savedPresets, setSavedPresets] = useState<SavedSettingsProfile[]>([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presets when profile changes
  useEffect(() => {
    if (activeProfile?.email) {
      const stored = localStorage.getItem(`chatbot_presets_${activeProfile.email}`);
      let parsed: SavedSettingsProfile[] = [];
      if (stored) {
        try {
          parsed = JSON.parse(stored);
        } catch (e) {
          parsed = [];
        }
      }
      setSavedPresets(parsed);

      const lastIndex = localStorage.getItem(`chatbot_last_preset_${activeProfile.email}`);
      if (lastIndex !== null && lastIndex !== '' && !isNaN(Number(lastIndex))) {
        const index = Number(lastIndex);
        if (index >= 0 && index < parsed.length) {
          setSelectedPresetIndex(index);
          handleLoadPresetDirect(parsed[index]);
        } else {
          setSelectedPresetIndex('');
        }
      } else {
        setSelectedPresetIndex('');
      }
    } else {
      setSavedPresets([]);
      setSelectedPresetIndex('');
    }
  }, [activeProfile?.email]);

  const savePresetsToStorage = (presets: SavedSettingsProfile[]) => {
    if (activeProfile?.email) {
      localStorage.setItem(`chatbot_presets_${activeProfile.email}`, JSON.stringify(presets));
      setSavedPresets(presets);
    }
  };

  const setAndSaveSelectedPresetIndex = (index: number | '') => {
    setSelectedPresetIndex(index);
    if (activeProfile?.email) {
      localStorage.setItem(`chatbot_last_preset_${activeProfile.email}`, String(index));
    }
  };

  const handleSavePreset = () => {
    let isUpdate = false;
    let targetIndex = -1;
    let presetName = '';

    if (selectedPresetIndex !== '') {
      targetIndex = Number(selectedPresetIndex);
      const currentPreset = savedPresets[targetIndex];
      if (currentPreset) {
        const doUpdate = confirm(`Update existing preset "${currentPreset.name}"?\n\nClick OK to update it with current values, or Cancel to save as a new preset.`);
        if (doUpdate) {
          isUpdate = true;
          presetName = currentPreset.name;
        }
      }
    }

    if (!isUpdate) {
      const namePrompt = prompt('Enter a name for this configuration preset:');
      if (!namePrompt) return;
      presetName = namePrompt;
    }
    
    const newPreset: SavedSettingsProfile = {
      name: presetName,
      selectedModel,
      includeMetadata,
      excludeSeen,
      retry,
      ragCandidates,
      ragLlmResponse,
      ragRecommendations,
      ragAugmentation,
      ragMinRating,
      cfCandidates,
      cfLlmResponse,
      cfRecommendations,
      cfAugmentation,
      cfKUsers,
      cfMinRating,
      cfTextQueryLimit,
      cfRandomSelectionItemsByUser,
      cfMaxItemsByUser,
      cfRankCriterion,
      cfNeighborhoodExpansionRatio,
      cfMaxExpansionAttempts,
      ragShuffle,
      cfShuffle,
    };
    
    if (isUpdate) {
      const updated = [...savedPresets];
      updated[targetIndex] = newPreset;
      savePresetsToStorage(updated);
      // Index remains the same
    } else {
      const updated = [...savedPresets, newPreset];
      savePresetsToStorage(updated);
      setAndSaveSelectedPresetIndex(updated.length - 1);
    }
  };

  const handleLoadPresetDirect = (preset: SavedSettingsProfile) => {
    onSelectModel(preset.selectedModel);
    if (preset.includeMetadata !== undefined) onToggleMetadata(preset.includeMetadata);
    if (preset.excludeSeen !== undefined) onToggleExcludeSeen(preset.excludeSeen);
    if (preset.retry !== undefined) onSetRetry(preset.retry);
    if (preset.ragCandidates !== undefined) onSetRagCandidates(preset.ragCandidates);
    if (preset.ragLlmResponse !== undefined) onSetRagLlmResponse(preset.ragLlmResponse);
    if (preset.ragRecommendations !== undefined) onSetRagRecommendations(preset.ragRecommendations);
    if (preset.ragAugmentation !== undefined) onSetRagAugmentation(preset.ragAugmentation);
    if (preset.ragMinRating !== undefined) onSetRagMinRating(preset.ragMinRating);
    if (preset.cfCandidates !== undefined) onSetCfCandidates(preset.cfCandidates);
    if (preset.cfLlmResponse !== undefined) onSetCfLlmResponse(preset.cfLlmResponse);
    if (preset.cfRecommendations !== undefined) onSetCfRecommendations(preset.cfRecommendations);
    if (preset.cfAugmentation !== undefined) onSetCfAugmentation(preset.cfAugmentation);
    if (preset.cfKUsers !== undefined) onSetCfKUsers(preset.cfKUsers);
    if (preset.cfMinRating !== undefined) onSetCfMinRating(preset.cfMinRating);
    if (preset.cfTextQueryLimit !== undefined) onSetCfTextQueryLimit(preset.cfTextQueryLimit);
    if (preset.cfRandomSelectionItemsByUser !== undefined) onSetCfRandomSelectionItemsByUser(preset.cfRandomSelectionItemsByUser);
    if (preset.cfMaxItemsByUser !== undefined) onSetCfMaxItemsByUser(preset.cfMaxItemsByUser);
    if (preset.cfRankCriterion !== undefined) onSetCfRankCriterion(preset.cfRankCriterion);
    if (preset.cfNeighborhoodExpansionRatio !== undefined) onSetCfNeighborhoodExpansionRatio(preset.cfNeighborhoodExpansionRatio);
    if (preset.cfMaxExpansionAttempts !== undefined) onSetCfMaxExpansionAttempts(preset.cfMaxExpansionAttempts);
    if (preset.ragShuffle !== undefined) onToggleRagShuffle(preset.ragShuffle);
    if (preset.cfShuffle !== undefined) onToggleCfShuffle(preset.cfShuffle);
  };

  const handleLoadPreset = (index: number) => {
    const preset = savedPresets[index];
    if (!preset) return;
    handleLoadPresetDirect(preset);
    setAndSaveSelectedPresetIndex(index);
  };

  const handleDeletePreset = (index: number) => {
    if (confirm('Delete this preset?')) {
      const updated = [...savedPresets];
      updated.splice(index, 1);
      savePresetsToStorage(updated);
      setAndSaveSelectedPresetIndex('');
    }
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(savedPresets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbot-presets-${activeProfile?.email || 'export'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as SavedSettingsProfile[];
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        
        if (savedPresets.length > 0) {
          const overwrite = confirm('Do you want to completely overwrite your existing presets? (Cancel to append them instead)');
          if (overwrite) {
            savePresetsToStorage(imported);
            setAndSaveSelectedPresetIndex('');
          } else {
            savePresetsToStorage([...savedPresets, ...imported]);
          }
        } else {
          savePresetsToStorage(imported);
        }
      } catch (err) {
        alert('Failed to import presets. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save the showSettings state in localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_show_settings', String(showSettings));
  }, [showSettings]);
  

  const isWarmStart = ratingsCount >= 20;

  const [isRagExpanded, setIsRagExpanded] = useState(!isWarmStart);
  const [isCfExpanded, setIsCfExpanded] = useState(isWarmStart);

  useEffect(() => {
    setIsRagExpanded(!isWarmStart);
    setIsCfExpanded(isWarmStart);
  }, [isWarmStart]);






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
    <aside className={`
      w-80 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-[100dvh] overflow-hidden shrink-0 z-50
      fixed md:relative inset-y-0 left-0 shadow-2xl md:shadow-none
      transition-transform duration-300 ease-in-out md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* App Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-600/10 to-transparent shrink-0">
        <div className="flex items-center space-x-3">
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

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 md:pb-8">
        {/* Profile management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active User Profiles
            </span>
            <button
              onClick={onOpenCreateProfileModal}
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
                      : 'bg-slate-950/20 border-slate-800/80 hover:bg-slate-850/40 hover:border-slate-700/80 text-slate-300'
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

      {/* Footer Settings Accordion (The Hyperparameter Tuning Dashboard!) - Merged inline inside main scrollable div */}
      <div className="border-t border-slate-800/60 bg-slate-950/10 mt-6 pt-4 shrink-0">
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
          <div className="px-4 pb-4 space-y-5 text-left border-t border-slate-800/20 pt-3">
            {/* Presets Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Saved Presets</span>
              </span>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <select
                    value={selectedPresetIndex}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPresetIndex(val === '' ? '' : Number(val));
                      if (val !== '') {
                        handleLoadPreset(Number(val));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition appearance-none cursor-pointer pr-6"
                  >
                    <option value="">-- Load a Preset --</option>
                    {savedPresets.map((p, idx) => (
                      <option key={idx} value={idx}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
                {selectedPresetIndex !== '' && (
                  <button
                    onClick={() => handleDeletePreset(Number(selectedPresetIndex))}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                    title="Delete Preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSavePreset}
                  className="p-1.5 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 rounded-lg transition shrink-0"
                  title="Save current configuration as new preset"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportPresets}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                  title="Export presets to JSON file"
                  disabled={savedPresets.length === 0}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                  title="Import presets from JSON file"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImportPresets}
                />
              </div>
            </div>

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
                <TouchSafeRange
                  min="1"
                  max="5"
                  value={retry}
                  onChange={(e) => onSetRetry(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer touch-pan-y" style={{ touchAction: 'pan-y' }}
                />
              </div>
            </div>

            {/* RAG Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <button onClick={() => setIsRagExpanded(!isRagExpanded)} className="w-full flex items-center justify-between border-b border-slate-800/40 pb-2 hover:bg-slate-800/30 transition-colors rounded-sm px-1 -mx-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RAG Pipeline (Cold-Start)</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${!isWarmStart ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-950 border-slate-855 text-slate-500'}`}>
                    {!isWarmStart ? '🟢 Active' : '⚪ Inactive'}
                  </span>
                  {isRagExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isRagExpanded && (
              <div className={`${isWarmStart ? 'opacity-40 select-none' : ''} animate-in slide-in-from-top-2`}>
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
                    <TouchSafeRange
                      min="5"
                      max="100"
                      step="5"
                      disabled={isWarmStart}
                      value={ragCandidates}
                      onChange={(e) => onSetRagCandidates(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* RAG LLM Max Generation Limit (Increased max to 100!) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        LLM Max Generation Limit (llm_response_limit)
                        {renderInfoTrigger(
                          'LLM Max Generation Limit',
                          'Indica el valor de llm_response_limit que se inyecta directamente en la instrucción del prompt del LLM (ej. "Recommend up to {X} movies"). Alterar este valor cambia el texto del prompt, rompiendo el caché y forzando inferencias reales de Ollama.',
                          'Instrucción compacta en el prompt. Ollama genera menos candidatos textuales, acelerando el proceso.',
                          'Instrucción extendida de hasta 100 candidatos. Ollama genera un bloque de texto final más extenso.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragLlmResponse}</span>
                    </div>
                    <TouchSafeRange
                      min="1"
                      max="100"
                      disabled={isWarmStart}
                      value={ragLlmResponse}
                      onChange={(e) => onSetRagLlmResponse(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* RAG Final Recommendations Limit (Increased max to 100!) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Final Recommendations Limit (recommendations_limit)
                        {renderInfoTrigger(
                          'Final Recommendations Limit',
                          'Es el límite que toma tu recommendations_factory en el backend para recortar y truncar la respuesta final JSON enviada. Si es menor al límite de generación del LLM, permite podar resultados de manera programática.',
                          'Salida del JSON final extremadamente compacta.',
                          'Salida del JSON final extendida de hasta 100 películas.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragRecommendations}</span>
                    </div>
                    <TouchSafeRange
                      min="1"
                      max="100"
                      disabled={isWarmStart}
                      value={ragRecommendations}
                      onChange={(e) => onSetRagRecommendations(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
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
                    <TouchSafeRange
                      min="0"
                      max="10"
                      disabled={isWarmStart}
                      value={ragAugmentation}
                      onChange={(e) => onSetRagAugmentation(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Min Rating (min_rating_by_user)
                        {renderInfoTrigger(
                          'Min Rating (RAG)',
                          'Minimum rating required for a candidate movie to be retrieved from ChromaDB.',
                          'Lower quality movies can be retrieved.',
                          'Strictly fetches high-quality rated movies.'
                        )}
                      </span>
                      <span className="text-indigo-400 font-bold">{ragMinRating.toFixed(1)} ★</span>
                    </div>
                    <TouchSafeRange
                      min="0.0"
                      max="5.0"
                      step="0.5"
                      disabled={isWarmStart}
                      value={ragMinRating}
                      onChange={(e) => onSetRagMinRating(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
                    <span className="text-xs text-slate-400 flex items-center">
                      Shuffle Candidates
                      {renderInfoTrigger(
                        'Shuffle Candidates (RAG)',
                        'Si está activo, mezcla aleatoriamente las películas recuperadas de ChromaDB antes de que el LLM realice la selección y ordenación final. Esto ayuda a romper el sesgo de orden y aporta diversidad.',
                        'Conserva estrictamente el orden de cercanía del RAG.',
                        'Mezcla los resultados, rompiendo el sesgo estático de los primeros candidatos.'
                      )}
                    </span>
                    <input
                      type="checkbox"
                      disabled={isWarmStart}
                      checked={ragShuffle}
                      onChange={(e) => onToggleRagShuffle(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-800 bg-slate-950 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Collaborative Filtering Settings */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <button onClick={() => setIsCfExpanded(!isCfExpanded)} className="w-full flex items-center justify-between border-b border-slate-800/40 pb-2 hover:bg-slate-800/30 transition-colors rounded-sm px-1 -mx-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Collaborative Filtering (Warm)</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${isWarmStart ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-950 border-slate-855 text-slate-500'}`}>
                    {isWarmStart ? '🟢 Active' : '🔒 Locked'}
                  </span>
                  {isCfExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isCfExpanded && (
              <div className="animate-in slide-in-from-top-2 mt-2">
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
                    <TouchSafeRange
                      min="5"
                      max="100"
                      step="5"
                      disabled={!isWarmStart}
                      value={cfCandidates}
                      onChange={(e) => onSetCfCandidates(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF LLM Max Generation Limit (Increased max to 100!) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        CF LLM Generation Limit (llm_response_limit)
                        {renderInfoTrigger(
                          'CF LLM Generation Limit',
                          'Configura el llm_response_limit inyectado directamente en el prompt colaborativo del LLM, instruyendo la cantidad máxima de recomendaciones textuales a generar.',
                          'Ollama genera menos textos, acelerando radicalmente la inferencia.',
                          'Ollama genera un bloque de texto final más numeroso de hasta 100 películas.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfLlmResponse}</span>
                    </div>
                    <TouchSafeRange
                      min="1"
                      max="100"
                      disabled={!isWarmStart}
                      value={cfLlmResponse}
                      onChange={(e) => onSetCfLlmResponse(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Final Recommendations Limit (Increased max to 100!) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400">
                        CF Final Recommendations Limit (recommendations_limit)
                        {renderInfoTrigger(
                          'CF Final Recommendations Limit',
                          'Límite de películas colaborativas finales que el LLM filtrará e incluirá en la respuesta final JSON truncada.',
                          'Salida final muy recortada y directa.',
                          'Salida final extendida de hasta 100 películas.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfRecommendations}</span>
                    </div>
                    <TouchSafeRange
                      min="1"
                      max="100"
                      disabled={!isWarmStart}
                      value={cfRecommendations}
                      onChange={(e) => onSetCfRecommendations(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
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
                    <TouchSafeRange
                      min="0"
                      max="10"
                      disabled={!isWarmStart}
                      value={cfAugmentation}
                      onChange={(e) => onSetCfAugmentation(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
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
                    <TouchSafeRange
                      min="1"
                      max="100"
                      disabled={!isWarmStart}
                      value={cfKUsers}
                      onChange={(e) => onSetCfKUsers(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Min Rating */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Min Rating (min_rating_by_user)
                        {renderInfoTrigger(
                          'Min Rating',
                          'Calificación mínima que debe tener una película en el historial de un usuario similar para ser considerada como candidata.',
                          'Acepta películas con malas calificaciones en el historial de los vecinos.',
                          'Filtra solo las mejores calificaciones de los vecinos.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfMinRating.toFixed(1)} ★</span>
                    </div>
                    <TouchSafeRange
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      disabled={!isWarmStart}
                      value={cfMinRating}
                      onChange={(e) => onSetCfMinRating(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Max Items By User */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Max Items By User (max_items_by_user)
                        {renderInfoTrigger(
                          'Max Items By User',
                          'Límite de películas a extraer del historial de cada usuario similar.',
                          'Extrae pocas películas, perdiendo historia valiosa.',
                          'Extrae hasta 100 películas por usuario, aumentando los candidatos.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfMaxItemsByUser}</span>
                    </div>
                    <TouchSafeRange
                      min="1"
                      max="100"
                      step="1"
                      disabled={!isWarmStart}
                      value={cfMaxItemsByUser}
                      onChange={(e) => onSetCfMaxItemsByUser(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Random Selection */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Retention Rate (random_selection_items_by_user)
                        {renderInfoTrigger(
                          'Retention Rate',
                          'Porcentaje de películas seleccionadas aleatoriamente del historial de los usuarios similares (1.0 = retiene el 100%).',
                          'Descarta muchas películas, aumenta diversidad pero reduce pool.',
                          'Conserva el 100% de las películas extraídas.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{(cfRandomSelectionItemsByUser * 100).toFixed(0)}%</span>
                    </div>
                    <TouchSafeRange
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      disabled={!isWarmStart}
                      value={cfRandomSelectionItemsByUser}
                      onChange={(e) => onSetCfRandomSelectionItemsByUser(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Text Query Limit */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Text Query Limit (text_query_limit)
                        {renderInfoTrigger(
                          'Text Query Limit',
                          'Límite de películas a recuperar de ChromaDB para cruzar con las extraídas por los usuarios similares.',
                          'Bajo cruce, pocos resultados finales.',
                          'Gran volumen de recuperación en ChromaDB para el cruce.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfTextQueryLimit}</span>
                    </div>
                    <TouchSafeRange
                      min="1000"
                      max="12000"
                      step="1000"
                      disabled={!isWarmStart}
                      value={cfTextQueryLimit}
                      onChange={(e) => onSetCfTextQueryLimit(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Rank Criterion */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Rank Criterion
                        {renderInfoTrigger(
                          'Rank Criterion',
                          'Criterio de ordenamiento para rankear los candidatos de CF antes del recorte final.',
                          '-',
                          '-'
                        )}
                      </span>
                    </div>
                    <select
                      value={cfRankCriterion}
                      onChange={(e) => onSetCfRankCriterion(e.target.value)}
                      disabled={!isWarmStart}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-40 text-slate-200"
                    >
                      <option value="user_sim_weighted_pred_rating_score">User Sim Weighted Pred Rating</option>
                      <option value="user_sim_weighted_rating_score">User Sim Weighted Rating</option>
                      <option value="user_item_sim">User Item Sim</option>
                      <option value="pred_user_rating">Predicted User Rating</option>
                    </select>
                  </div>

                  {/* CF Expansion Ratio */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Expansion Ratio
                        {renderInfoTrigger(
                          'Neighborhood Expansion Ratio',
                          'Ratio multiplicador para expandir el vecindario (k_sim_users y max_items) si no se encuentran suficientes candidatos no vistos.',
                          'Búsqueda estricta, no se amplía si se agotan.',
                          'Multiplica agresivamente la red de vecinos si faltan candidatos.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfNeighborhoodExpansionRatio.toFixed(1)}x</span>
                    </div>
                    <TouchSafeRange
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      disabled={!isWarmStart}
                      value={cfNeighborhoodExpansionRatio}
                      onChange={(e) => onSetCfNeighborhoodExpansionRatio(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  {/* CF Max Expansion Attempts */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        Max Expansion Attempts
                        {renderInfoTrigger(
                          'Max Expansion Attempts',
                          'Número máximo de iteraciones permitidas para el bucle de expansión de candidatos.',
                          'Desactiva el bucle de expansión de búsqueda.',
                          'Permite hasta 5 ciclos completos de expansión multiplicativa.'
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold">{cfMaxExpansionAttempts}</span>
                    </div>
                    <TouchSafeRange
                      min="0"
                      max="5"
                      step="1"
                      disabled={!isWarmStart}
                      value={cfMaxExpansionAttempts}
                      onChange={(e) => onSetCfMaxExpansionAttempts(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-pan-y" style={{ touchAction: 'pan-y' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
                    <span className="text-xs text-slate-400 flex items-center">
                      Shuffle Candidates
                      {renderInfoTrigger(
                        'Shuffle Candidates (CF)',
                        'Si está activo, mezcla de forma aleatoria los candidatos recuperados por Filtrado Colaborativo antes de que sean evaluados por el LLM. Útil para aportar serendipia y romper el sesgo determinista.',
                        'Conserva el orden estricto de recomendación calculado por el algoritmo de filtrado.',
                        'Aporta mayor variedad y rompe patrones de orden fijos.'
                      )}
                    </span>
                    <input
                      type="checkbox"
                      disabled={!isWarmStart}
                      checked={cfShuffle}
                      onChange={(e) => onToggleCfShuffle(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 border-slate-800 bg-slate-950 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              </div>
              )}
            </div>
          </div>
        )}
      </div>


      </div>

      {/* Global Viewport-Level Draggable/Floating Hover Tooltip (Fixed position, 100% immune to scroll clippings) */}
      {hoverHelp && createPortal(
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
        </div>,
        document.body
      )}
    </aside>
  );
};
