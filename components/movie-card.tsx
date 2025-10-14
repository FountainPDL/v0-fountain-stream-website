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

  useEffect(() => {
    const fetchRating = async () => {
      try {
        if (mediaType === "movie") {
          const cert = await getMovieCertification(movie.id)
          setCertification(cert)
        } else if (mediaType === "tv") {
          const cert = await getTVContentRating(movie.id)
          setCertification(cert)
        }
      } catch (error) {
        setCertification("")
      }
    }
    fetchRating()
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
    <Link href={`/watch/${mediaType}/${movie.id}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={imageError ? "/placeholder.svg?height=450&width=300" : getImageUrl(movie.poster_path)}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Play className="h-8 w-8 fountain-glow" />
                  <span className="text-sm font-semibold">Watch Now</span>
                </div>
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
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{year}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
