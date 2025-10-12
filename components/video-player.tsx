"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server } from "lucide-react"
import { addToWatchHistory, getUserPreferences } from "@/lib/storage"

interface VideoPlayerProps {
  mediaType: "movie" | "tv"
  tmdbId: number
  imdbId?: string
  season?: number
  episode?: number
  title: string
  posterPath?: string
}

export function VideoPlayer({ mediaType, tmdbId, imdbId, season, episode, title, posterPath }: VideoPlayerProps) {
  const [activeSource, setActiveSource] = useState("vidsrc")

  useEffect(() => {
    const prefs = getUserPreferences()
    setActiveSource(prefs.defaultServer)

    addToWatchHistory({
      id: tmdbId.toString(),
      type: mediaType,
      title,
      posterPath: posterPath || "",
      progress: 0,
      season,
      episode,
    })
  }, [tmdbId, mediaType, title, posterPath, season, episode])

  const getEmbedUrl = (source: string) => {
    const id = imdbId || tmdbId.toString()

    switch (source) {
      case "vidsrc":
        if (mediaType === "movie") {
          return `https://vidsrc.to/embed/movie/${id}`
        }
        return `https://vidsrc.to/embed/tv/${id}${season ? `/${season}` : ""}${episode ? `/${episode}` : ""}`

      case "2embed":
        if (mediaType === "movie") {
          return `https://www.2embed.cc/embed/${id}`
        }
        return `https://www.2embed.cc/embedtv/${id}${season && episode ? `&s=${season}&e=${episode}` : ""}`

      case "autoembed":
        if (mediaType === "movie") {
          return `https://player.autoembed.cc/embed/movie/${id}`
        }
        return `https://player.autoembed.cc/embed/tv/${id}${season ? `/${season}` : ""}${episode ? `/${episode}` : ""}`

      case "superembed":
        if (mediaType === "movie") {
          return `https://multiembed.mov/?video_id=${id}`
        }
        return `https://multiembed.mov/?video_id=${id}${season ? `&s=${season}` : ""}${episode ? `&e=${episode}` : ""}`

      default:
        return ""
    }
  }

  const sources = [
    { id: "vidsrc", name: "VidSrc" },
    { id: "2embed", name: "2Embed" },
    { id: "autoembed", name: "AutoEmbed" },
    { id: "superembed", name: "SuperEmbed" },
  ]

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getEmbedUrl(activeSource)}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video Player"
          />
        </div>

        {/* Source Selector */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Select Server:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <Badge
                key={source.id}
                variant={activeSource === source.id ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setActiveSource(source.id)}
              >
                {source.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
