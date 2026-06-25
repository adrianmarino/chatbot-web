import React, { useState } from 'react';
import { Star, Film, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import type { Recommendation } from '../services/api';

interface MovieCardProps {
  movie: Recommendation;
  onRateMovie: (rating: number) => Promise<void>;
  isRated: boolean;
  userRating?: number;
}

interface HoverHelp {
  title: string;
  explanation: string;
  lower: string;
  higher: string;
  rect: DOMRect;
}

const GRADIENTS = [
  'from-violet-650 to-indigo-900',
  'from-emerald-700 to-teal-900',
  'from-cyan-700 to-blue-900',
  'from-rose-700 to-purple-900',
  'from-amber-600 to-rose-900',
];

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onRateMovie,
  isRated,
  userRating,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [hoverHelp, setHoverHelp] = useState<HoverHelp | null>(null);

  // Pick a stable gradient based on the movie title length
  const gradientIdx = movie.title.length % GRADIENTS.length;
  const gradientClass = GRADIENTS[gradientIdx];

  const handleRate = async (r: number) => {
    if (isRated || ratingLoading) return;
    setRatingLoading(true);
    try {
      await onRateMovie(r);
    } catch (err) {
      console.error(err);
      alert('Failed to register rating.');
    } finally {
      setRatingLoading(false);
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

  // Viewport Collision-Aware Tooltip Positioning Algorithm
  const calculateTooltipStyles = (rect: DOMRect | null) => {
    if (!rect) return {};

    const tooltipWidth = 320;
    const tooltipHeight = 250; // estimated safe height
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

  // Convert similarity score to colored percentage badge
  const querySim = movie.metadata?.db_item?.query_sim;
  const matchPercentage = querySim ? Math.round(querySim * 100) : null;
  const matchColor =
    matchPercentage && matchPercentage >= 80
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : matchPercentage && matchPercentage >= 60
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      : 'bg-slate-500/10 border-slate-500/30 text-slate-400';

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden text-left flex flex-col h-full shadow-xl hover:border-slate-700 transition duration-200 group relative">
      {/* Poster / Fallback */}
      <div className="h-44 relative w-full overflow-hidden shrink-0">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              // On broken poster URL, hide the image and let the fallback show
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${gradientClass} flex flex-col items-center justify-center p-6 text-center`}>
            <Film className="w-8 h-8 text-white/40 mb-2" />
            <span className="font-bold text-lg text-white/90 leading-tight truncate max-w-full">
              {movie.title}
            </span>
            <span className="text-xs text-white/50 font-medium mt-1">{movie.release}</span>
          </div>
        )}

        {/* Absolute Badges on Cover */}
        {matchPercentage !== null && (
          <div
            onMouseEnter={(e) => showHelp(
              e,
              "Coincidencia Semántica (Match)",
              "Nivel de similitud matemática (distancia coseno sobre embeddings vectoriales de MPNet) calculada en ChromaDB entre los conceptos de tu búsqueda textual y la sinopsis/metadatos de la película.",
              "Afinidad conceptual baja o indirecta con los términos de tu prompt.",
              "Fuerte afinidad temática directa con la intención y conceptos expresados en tu consulta."
            )}
            onMouseLeave={hideHelp}
            className={`absolute top-3 right-3 px-2 py-1 rounded-lg border backdrop-blur-md text-xs font-bold cursor-help ${matchColor}`}
          >
            {matchPercentage}% Match
          </div>
        )}

        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-200">
          {movie.release}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col space-y-4">
        <div>
          <h4 className="font-bold text-slate-100 text-base leading-snug group-hover:text-violet-400 transition truncate" title={movie.title}>
            {movie.title}
          </h4>
          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="bg-slate-950/80 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-semibold"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Plot Description with Expand/Collapse */}
        <div className="text-xs text-slate-400 leading-relaxed flex-1">
          <p>
            {isExpanded || movie.description.length <= 130
              ? movie.description
              : `${movie.description.substring(0, 120)}...`}
          </p>
          {movie.description.length > 130 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-violet-400 hover:text-violet-300 font-semibold mt-1.5 inline-flex items-center space-x-1"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Technical Insights Drawer */}
        {movie.metadata && (
          <div>
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              onMouseEnter={(e) => showHelp(
                e,
                "Métricas Vectoriales de ChromaDB",
                "Despliega las distancias matemáticas exactas guardadas en la base de datos: ID del catálogo, similitud semántica con tu consulta (`query_sim`), afinidad del título (`title_sim`) y el rating promedio del catálogo.",
                "Visualización limpia, simplificada y compacta.",
                "Auditoría matemática completa de la posición y el peso del vector de la película en el espacio multidimensional."
              )}
              onMouseLeave={hideHelp}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center space-x-1.5 cursor-help"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showTechnical ? 'Hide Technical Metrics' : 'See Similarity Metrics'}</span>
            </button>

            {showTechnical && (
              <div className="mt-2 bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-[10px] font-mono space-y-1 text-slate-400">
                <p className="flex justify-between">
                  <span>DB Movie ID:</span>
                  <span className="text-slate-300">{movie.metadata.db_item.id}</span>
                </p>
                <p className="flex justify-between">
                  <span>Query Similarity:</span>
                  <span className="text-slate-200">{(movie.metadata.db_item.query_sim).toFixed(4)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Title Similarity:</span>
                  <span className="text-slate-200">{(movie.metadata.db_item.title_sim).toFixed(4)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Avg DB Rating:</span>
                  <span className="text-slate-200">{movie.metadata.db_item.rating.toFixed(1)} / 5.0</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer - Stars Interactive Rating */}
      <div
        className="px-4 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between hover:bg-slate-950/80 transition duration-150"
      >
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {isRated ? 'Your Rating:' : 'Rate this movie:'}
        </span>

        {isRated ? (
          <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            <Check className="w-3 h-3" />
            <span>Rated {userRating || 5}/5</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating !== null ? star <= hoverRating : false;
              return (
                <button
                  key={star}
                  disabled={ratingLoading}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleRate(star)}
                  className={`p-0.5 transition rounded hover:bg-slate-850 ${
                    active ? 'text-amber-400' : 'text-slate-600'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              );
            })}
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
