"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, RefreshCw, Download } from "lucide-react"
import { SubtitleSelector } from "@/components/subtitle-selector"
import JSZip from "jszip"

interface VideoPlayerProps {
  sources: Array<{ url: string; type: string; label: string }>
  title: string
  posterPath?: string
  mediaType?: "movie" | "tv"
  tmdbId?: number
  season?: number
  episode?: number
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
  nextEpisodeUrl?: string
  previousEpisodeUrl?: string
}

export function VideoPlayerNew({
  sources,
  title,
  posterPath,
  mediaType,
  tmdbId,
  season,
  episode,
  hasNextEpisode,
  nextEpisodeUrl,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeSource, setActiveSource] = useState(0)
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (error && retryCount < sources.length - 1) {
      const timer = setTimeout(() => {
        console.log("[v0] Auto-switching to next source due to error")
        setActiveSource((prev) => (prev + 1) % sources.length)
        setError(false)
        setRetryCount((prev) => prev + 1)
        setIsLoading(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [error, retryCount, sources.length])

  useEffect(() => {
    if (hasNextEpisode && nextEpisodeUrl) {
      const handleAutoNext = () => {
        console.log("[v0] Auto-playing next episode")
        window.location.href = nextEpisodeUrl
      }
      // Listen for video end events (if accessible)
      window.addEventListener("videoended", handleAutoNext)
      return () => window.removeEventListener("videoended", handleAutoNext)
    }
  }, [hasNextEpisode, nextEpisodeUrl])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    console.log("[v0] Iframe failed to load")
    setIsLoading(false)
    setError(true)
  }

  const handleSecureDownload = async () => {
    try {
      const zip = new JSZip()
      const fileName = `${title.replace(/[^a-z0-9]/gi, "_")}_download_info.txt`
      const content = `
FountainHome Download Info
=========================
Title: ${title}
Type: ${mediaType}
${season ? `Season: ${season}` : ""}
${episode ? `Episode: ${episode}` : ""}

Available Sources:
${sources.map((s, i) => `${i + 1}. ${s.label}: ${s.url}`).join("\n")}

Note: Right-click on the source URL and open in new tab to access the video.
Use browser extensions or download managers for best results.
`
      zip.file(fileName, content)
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_sources.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Download failed:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading video...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <p className="text-sm text-red-500">Failed to load. Switching mirrors...</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${activeSource}-${retryCount}`}
              src={sources[activeSource]?.url}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title="Video Player"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>

          <div className="p-3 sm:p-4 border-t border-border/50 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium">Source:</span>
                <div className="relative flex-1 max-w-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm bg-transparent flex items-center justify-between gap-2 touch-manipulation"
                    onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                  >
                    <span className="truncate">{sources[activeSource]?.label || "Select Source"}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                  {sourceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSourceDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 flex flex-col bg-background border border-border rounded-lg p-1 gap-1 z-50 shadow-lg max-h-60 overflow-y-auto">
                        {sources.map((source, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={activeSource === index ? "default" : "ghost"}
                            onClick={() => {
                              setActiveSource(index)
                              setSourceDropdownOpen(false)
                              setRetryCount(0)
                              setError(false)
                              setIsLoading(true)
                            }}
                            className="text-xs justify-start touch-manipulation"
                          >
                            {source.label}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSecureDownload}
                className="gap-2 touch-manipulation bg-transparent"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                Source {activeSource + 1}/{sources.length}
              </Badge>
              {retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Retry {retryCount}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtitle Selector */}
      {mediaType && tmdbId && (
        <SubtitleSelector mediaType={mediaType} tmdbId={tmdbId} season={season} episode={episode} />
      )}
    </div>
  )
}
