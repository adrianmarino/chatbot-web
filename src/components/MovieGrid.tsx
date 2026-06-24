import React from 'react';
import { Clapperboard, AlertCircle, Sliders } from 'lucide-react';
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
    return (
      <div className="py-4 space-y-4 font-sans text-left">
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 text-center space-y-4">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-amber-500 animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <h4 className="font-bold text-slate-200 text-sm">
              No encontré resultados para esta pregunta
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              El modelo LLM o los filtros matemáticos de tu pipeline (RAG o CF) fueron sumamente restrictivos, resultando en cero películas sugeridas.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl text-left text-xs max-w-md mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Cómo calibrar los hiperparámetros para solucionarlo:</span>
            </span>
            <ul className="space-y-1.5 pl-1 text-[11px] text-slate-400 leading-relaxed list-none">
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">1.</span>
                <span>Incrementa el <strong>'Candidates Retrieval Limit'</strong> en la barra lateral para darle al LLM un lote inicial de contexto más numeroso.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">2.</span>
                <span>Reduce el umbral de <strong>'Min Rating Threshold'</strong> (ej: a 3.0★ o 2.5★) si estás en modo colaborativo (Warm-Start), para aceptar más películas.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-1.5 select-none font-bold">3.</span>
                <span>Asegúrate de que las preferencias de tu <strong>Perfil de Usuario</strong> (décadas o géneros favoritos) no estén entrando en conflicto directo con los términos de tu pregunta.</span>
              </li>
            </ul>
          </div>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
