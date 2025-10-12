"use client"

import { MovieCard } from "./movie-card"
import type { Movie } from "@/lib/tmdb"

interface CategorySectionProps {
  title: string
  movies: Movie[]
}

export function CategorySection({ title, movies }: CategorySectionProps) {
  return (
    <section className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-balance">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
        ))}
      </div>
    </section>
  )
}
