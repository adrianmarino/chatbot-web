import React from 'react';
import { Clapperboard } from 'lucide-react';
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
            <p className="text-[10px] text-slate-500">
              Filtered and ranked by Large Language Model context judge
            </p>
          </div>
        </div>
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
