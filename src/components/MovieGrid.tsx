import React from 'react';
import { Sparkles, Clapperboard } from 'lucide-react';
import type { Recommendation } from '../services/api';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Recommendation[];
  onRateMovie: (movie: Recommendation, rating: number) => Promise<void>;
  ratedMovies: Record<string, number>;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  onRateMovie,
  ratedMovies,
}) => {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/40 px-6 py-8 space-y-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-left">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Personalized Recommendations</span>
              <span className="text-xs font-normal text-slate-500">({movies.length} items found)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Filtered and ranked by the Large Language Model context judge
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Interactive Ratings Enabled</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => {
          const movieId = movie.metadata?.db_item?.id || movie.title;
          const isRated = ratedMovies[movieId] !== undefined;
          const userRating = ratedMovies[movieId];

          return (
            <div key={movieId} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <MovieCard
                movie={movie}
                onRateMovie={(rating) => onRateMovie(movie, rating)}
                isRated={isRated}
                userRating={userRating}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
