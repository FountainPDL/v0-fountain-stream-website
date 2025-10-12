"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type Movie } from "@/lib/tmdb"

interface HeroBannerProps {
  movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const movie = movies[currentIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [movies.length])

  if (!movie) return null

  const title = movie.title || movie.name || "Untitled"
  const mediaType = movie.media_type || "movie"

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(movie.backdrop_path, "original") || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative h-full flex items-center px-4">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance fountain-glow-intense">{title}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            {movie.vote_average && (
              <Badge variant="secondary" className="text-sm">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </Badge>
            )}
            {movie.release_date && (
              <Badge variant="outline" className="text-sm">
                {movie.release_date.split("-")[0]}
              </Badge>
            )}
            {movie.first_air_date && (
              <Badge variant="outline" className="text-sm">
                {movie.first_air_date.split("-")[0]}
              </Badge>
            )}
          </div>

          <p className="text-base md:text-lg text-muted-foreground line-clamp-3 text-pretty">{movie.overview}</p>

          <div className="flex gap-3 flex-wrap">
            <Button asChild size="lg" className="fountain-glow">
              <Link href={`/watch/${mediaType}/${movie.id}`}>
                <Play className="mr-2 h-5 w-5" />
                Watch Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/watch/${mediaType}/${movie.id}`}>
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-primary" : "w-4 bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
