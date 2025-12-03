"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import { useState, useEffect } from "react"
import { getMovieCertification, getTVContentRating } from "@/lib/tmdb"

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const [certification, setCertification] = useState<string>("")
  const title = movie.title || movie.name || "Untitled"
  const year = movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0]
  const rating = movie.vote_average?.toFixed(1)
  const mediaType = movie.media_type || "movie"
  const genres = movie.genres || []
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  useEffect(() => {
    const fetchRating = async () => {
      try {
        let cert = ""
        if (mediaType === "movie") {
          cert = await getMovieCertification(movie.id)
        } else if (mediaType === "tv") {
          cert = await getTVContentRating(movie.id)
        }
        setCertification(cert || "")
      } catch (error) {
        setCertification("")
      }
    }

    const timer = setTimeout(fetchRating, Math.random() * 500)
    return () => clearTimeout(timer)
  }, [movie.id, mediaType])

  const getCertificationColor = (cert: string) => {
    const upper = cert.toUpperCase()
    if (["G", "TV-Y", "TV-G"].includes(upper)) return "bg-green-600"
    if (["PG", "TV-PG"].includes(upper)) return "bg-blue-600"
    if (["PG-13", "TV-14"].includes(upper)) return "bg-yellow-600"
    if (["R", "TV-MA", "NC-17"].includes(upper)) return "bg-red-600"
    return "bg-gray-600"
  }

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 flex flex-col h-full">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={imageError ? "/placeholder.svg?height=450&width=300" : getImageUrl(movie.poster_path)}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {genres.slice(0, 3).map((genre: any) => (
                    <Badge key={genre.id} variant="secondary" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}
              {movie.overview && <p className="text-white text-xs line-clamp-2 mb-2 leading-tight">{movie.overview}</p>}
              <Link
                href={`/watch/${mediaType}/${movie.id}-${slug}`}
                className="flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary/90 rounded px-2 py-1 text-sm font-semibold transition-colors"
              >
                <Play className="h-4 w-4" />
                Watch Now
              </Link>
            </div>
          </div>
          {rating && (
            <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating}
            </Badge>
          )}
          {certification && (
            <Badge
              className={`absolute top-2 left-2 ${getCertificationColor(certification)} text-white border-0 font-bold`}
            >
              {certification}
            </Badge>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{year}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
