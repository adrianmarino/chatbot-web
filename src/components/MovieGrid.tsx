import React from 'react';
import { Clapperboard, RotateCw } from 'lucide-react';
import type { Recommendation } from '../services/api';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Recommendation[];
  onRateMovie: (movie: Recommendation, rating: number) => Promise<void>;
  ratedMovies: Record<string, number>;
  onRegenerate?: () => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  onRateMovie,
  ratedMovies,
  onRegenerate,
}) => {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-left">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">
              Personalized Recommendations ({movies.length} items)
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Filtered and ranked by Large Language Model context judge
            </p>
          </div>
        </div>

        {/* Regenerate/Refresh Button */}
        {onRegenerate && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onRegenerate();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-[10px] font-bold transition duration-150 cursor-pointer shadow-sm shadow-violet-500/5 select-none"
            title="Regenerar estas recomendaciones con los parámetros e hiperparámetros actuales"
          >
            <RotateCw className="w-3.5 h-3.5 animate-in spin-in duration-300" />
            <span>Regenerar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {movies.map((movie) => {
          const movieId = movie.metadata?.db_item?.id || movie.title;
          const isRated = ratedMovies[movieId] !== undefined;
          const userRating = ratedMovies[movieId];

          return (
            <MovieCard
              key={movieId}
              movie={movie}
              onRateMovie={(rating) => onRateMovie(movie, rating)}
              isRated={isRated}
              userRating={userRating}
            />
          );
        })}
      </div>
    </div>
  );
};
