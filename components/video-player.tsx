"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, Subtitles, Play, Pause, AlertCircle } from "lucide-react"
import { addToWatchHistory, getUserPreferences } from "@/lib/storage"
import { SubtitleOverlay } from "@/components/subtitle-overlay"
import { type SubtitleCue, parseSRT } from "@/lib/subtitle-parser"

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
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [failedServers, setFailedServers] = useState<string[]>([])
  const [serverError, setServerError] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 0.1)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  const handleServerError = () => {
    const sources = ["vidsrc", "2embed", "autoembed", "superembed"]
    const currentIndex = sources.indexOf(activeSource)
    const newFailedServers = [...failedServers, activeSource]
    setFailedServers(newFailedServers)
    setServerError(true)

    // Find next available server that hasn't failed
    const nextServer = sources.find((source) => !newFailedServers.includes(source))

    if (nextServer) {
      setTimeout(() => {
        setActiveSource(nextServer)
        setServerError(false)
      }, 1500)
    }
  }

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

  const loadSubtitleFile = async (subtitleUrl: string) => {
    try {
      const fullUrl = `/api/subtitles/download?url=${encodeURIComponent(subtitleUrl)}`
      const response = await fetch(fullUrl)
      const data = await response.json()

      if (data.content) {
        const cues = parseSRT(data.content)
        setSubtitleCues(cues)
        setSubtitlesEnabled(true)
        setCurrentTime(0)
        if (cues.length > 0) {
          alert(`Subtitle loaded successfully! ${cues.length} cues found.`)
        } else {
          alert("Subtitle file loaded but no cues were found. The file may be corrupted or in an unsupported format.")
        }
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error("Error loading subtitle:", error)
      alert("Failed to load subtitle file")
    }
  }

  useEffect(() => {
    ;(window as any).loadSubtitle = loadSubtitleFile

    return () => {
      delete (window as any).loadSubtitle
    }
  }, [])

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
          {serverError && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-primary mx-auto animate-pulse" />
                <p className="text-white font-medium">Server failed, switching to next available server...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            key={activeSource}
            src={getEmbedUrl(activeSource)}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video Player"
            onError={handleServerError}
          />

          <SubtitleOverlay cues={subtitleCues} currentTime={currentTime} enabled={subtitlesEnabled} />

          {subtitlesEnabled && subtitleCues.length > 0 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-black/80 hover:bg-black/90 backdrop-blur"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentTime(0)}
                className="bg-black/80 hover:bg-black/90 backdrop-blur text-xs"
              >
                Reset
              </Button>
              <div className="bg-black/80 backdrop-blur px-2 py-1 rounded text-xs text-white">
                {Math.floor(currentTime / 60)}:
                {Math.floor(currentTime % 60)
                  .toString()
                  .padStart(2, "0")}
              </div>
            </div>
          )}
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
                className={`cursor-pointer transition-all hover:scale-105 ${
                  failedServers.includes(source.id) ? "opacity-50 line-through" : ""
                }`}
                onClick={() => {
                  setActiveSource(source.id)
                  setServerError(false)
                }}
              >
                {source.name}
              </Badge>
            ))}
          </div>

          {subtitleCues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Subtitles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Subtitles Loaded</span>
                  <Badge variant="secondary" className="text-xs">
                    {subtitleCues.length} cues
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={subtitlesEnabled ? "default" : "outline"}
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                >
                  {subtitlesEnabled ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
