import React from 'react';
import { Clapperboard, RotateCw, AlertCircle, Sliders } from 'lucide-react';
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
    return (
      <div className="py-4 space-y-4 font-sans">
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 text-center space-y-4">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-amber-500 animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <h4 className="font-bold text-slate-200 text-sm">
              No matching recommendations found
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your active Large Language Model judge or database RAG/CF filters were too restrictive, resulting in a zero-candidate output.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl text-left text-xs max-w-md mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>How to fix this (Tune Hyperparameters):</span>
            </span>
            <ul className="space-y-1.5 pl-1 text-[11px] text-slate-400 leading-relaxed list-none">
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">1.</span>
                <span>Increase the <strong>'Candidates Retrieval Limit'</strong> in the sidebar to feed the LLM a larger context pool of movies to choose from.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">2.</span>
                <span>Lower the <strong>'Min Rating Threshold'</strong> (e.g. to 3.0★ or 2.5★) to include a wider range of user ratings in Collaborative Filtering.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">3.</span>
                <span>Ensure your active <strong>User Profile preferences</strong> (decade or genres) are not too narrow or conflicting with your text query.</span>
              </li>
            </ul>
          </div>

          {onRegenerate && (
            <div className="flex justify-center pt-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onRegenerate();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-xs font-bold transition duration-150 cursor-pointer shadow-sm select-none"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh and Retry Query</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
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

        {/* Refresh Button */}
        {onRegenerate && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onRegenerate();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-[10px] font-bold transition duration-150 cursor-pointer shadow-sm shadow-violet-500/5 select-none"
            title="Refresh these recommendations with the current hyperparameters and settings"
          >
            <RotateCw className="w-3.5 h-3.5 animate-in spin-in duration-300" />
            <span>Refresh</span>
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
