"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Subtitles,
} from "lucide-react"
import { SubtitleOverlay } from "@/components/subtitle-overlay"
import type { SubtitleCue } from "@/lib/subtitle-parser"

interface EnhancedPlayerProps {
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

export function EnhancedPlayer({
  sources,
  title,
  posterPath,
  mediaType,
  tmdbId,
  season,
  episode,
  hasNextEpisode,
  hasPreviousEpisode,
  nextEpisodeUrl,
  previousEpisodeUrl,
}: EnhancedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeSource, setActiveSource] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([])
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [subtitleOffset, setSubtitleOffset] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying])

  useEffect(() => {
    const loadSubtitleFile = async (subtitleUrl: string) => {
      try {
        const response = await fetch(`/api/subtitles/download?url=${encodeURIComponent(subtitleUrl)}`)
        const data = await response.json()
        if (data.cues) {
          setSubtitles(data.cues)
          setSubtitlesEnabled(true)
          setSubtitleOffset(0)
          if (videoRef.current) {
            videoRef.current.play()
          }
        }
      } catch (error) {
        console.error("Failed to load subtitles:", error)
      }
    }
    ;(window as any).loadSubtitle = loadSubtitleFile
    return () => {
      delete (window as any).loadSubtitle
    }
  }, [])

  const isIframeSource = sources[activeSource]?.type === "text/html"

  const handlePlayPause = () => {
    if (!isIframeSource && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeChange = (newTime: number) => {
    if (!isIframeSource && videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleSkip = (seconds: number) => {
    if (!isIframeSource && videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!isIframeSource && videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    }
  }

  const handleMute = () => {
    if (!isIframeSource && videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleSpeedChange = (speed: number) => {
    if (!isIframeSource && videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => console.error(err))
      } else {
        document.exitFullscreen().catch((err) => console.error(err))
      }
    }
  }

  const handlePictureInPicture = async () => {
    try {
      if (!isIframeSource && videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await videoRef.current.requestPictureInPicture()
        }
      }
    } catch (error) {
      console.error("PiP error:", error)
    }
  }

  const handleScreenshot = () => {
    if (!isIframeSource && videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const link = document.createElement("a")
        link.href = canvas.toDataURL()
        link.download = `${title}-${Math.floor(currentTime)}s.png`
        link.click()
      }
    }
  }

  const handleDownload = () => {
    const source = sources[activeSource]
    if (source) {
      const link = document.createElement("a")
      link.href = source.url
      link.download = `${title}.mp4`
      link.click()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === "ArrowRight") {
        handleSkip(5)
      } else if (e.code === "ArrowLeft") {
        handleSkip(-5)
      } else if (e.code === "KeyF") {
        handleFullscreen()
      } else if (e.code === "KeyM") {
        handleMute()
      } else if (e.code === "KeyP") {
        handlePictureInPicture()
      } else if (e.code === "KeyC") {
        setSubtitlesEnabled(!subtitlesEnabled)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("keydown", handleKeyPress)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [isPlaying, currentTime, duration, isFullscreen, subtitlesEnabled])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const adjustedCurrentTime = currentTime + subtitleOffset

  return (
    <>
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative aspect-video w-full bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (isPlaying) setShowControls(false)
            }}
          >
            {isIframeSource ? (
              <iframe
                ref={iframeRef}
                key={activeSource}
                src={sources[activeSource]?.url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
              />
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                poster={posterPath}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={sources[activeSource]?.url} type={sources[activeSource]?.type} />
                Your browser does not support the video tag.
              </video>
            )}

            {subtitles.length > 0 && !isIframeSource && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-20">
                <SubtitleOverlay
                  cues={subtitles}
                  currentTime={adjustedCurrentTime}
                  enabled={subtitlesEnabled}
                  isFullscreen={isFullscreen}
                />
              </div>
            )}

            {/* Controls Overlay - only show for non-iframe sources */}
            {!isIframeSource && (
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-4 ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Progress Bar */}
                <div className="mb-2 sm:mb-4">
                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => handleTimeChange(value)}
                    max={duration}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Control Buttons - Mobile optimized */}
                <div className="flex flex-col gap-2 sm:gap-0">
                  <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Play/Pause */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        title="Space"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      {/* Skip Buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSkip(-5)}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        title="Left Arrow"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSkip(5)}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        title="Right Arrow"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      {/* Volume */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMute}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        title="M"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={([value]) => handleVolumeChange(value)}
                        max={1}
                        step={0.1}
                        className="w-16 sm:w-20 hidden sm:block"
                      />

                      {/* Time Display */}
                      <span className="text-xs sm:text-sm text-white ml-1 sm:ml-2 min-w-fit">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      {/* Episode Navigation */}
                      {mediaType === "tv" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => previousEpisodeUrl && (window.location.href = previousEpisodeUrl)}
                            disabled={!hasPreviousEpisode}
                            className="text-white hover:bg-white/20 disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            title="Previous Episode"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-xs sm:text-sm text-white">
                            S{season}E{episode}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => nextEpisodeUrl && (window.location.href = nextEpisodeUrl)}
                            disabled={!hasNextEpisode}
                            className="text-white hover:bg-white/20 disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            title="Next Episode"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Subtitles */}
                      <Button
                        size="sm"
                        variant={subtitlesEnabled ? "default" : "ghost"}
                        onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                        className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${subtitlesEnabled ? "" : "text-white hover:bg-white/20"}`}
                        title="C"
                      >
                        <Subtitles className="h-4 w-4" />
                      </Button>

                      {/* Speed */}
                      <div className="relative group">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          {playbackSpeed}x
                        </Button>
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col bg-black/90 rounded-lg p-2 gap-1 z-50">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <Button
                              key={speed}
                              size="sm"
                              variant={playbackSpeed === speed ? "default" : "ghost"}
                              onClick={() => handleSpeedChange(speed)}
                              className="text-white hover:bg-white/20 w-12 text-xs"
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Screenshot */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleScreenshot}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex"
                        title="Take Screenshot"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>

                      {/* Download */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownload}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* Picture in Picture */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePictureInPicture}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex"
                        title="P"
                      >
                        <PictureInPicture2 className="h-4 w-4" />
                      </Button>

                      {/* Fullscreen */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        title="F"
                      >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Subtitle Offset Controls */}
                  {subtitles.length > 0 && subtitlesEnabled && (
                    <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm text-white flex-wrap">
                      <span>Offset:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSubtitleOffset(Math.max(-5, subtitleOffset - 0.5))}
                        className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                      >
                        -0.5s
                      </Button>
                      <span className="min-w-fit text-xs">{subtitleOffset.toFixed(1)}s</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSubtitleOffset(Math.min(5, subtitleOffset + 0.5))}
                        className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                      >
                        +0.5s
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSubtitleOffset(0)}
                        className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Source Selector - Mobile optimized */}
          {sources.length > 1 && (
            <div className="p-2 sm:p-4 border-t border-border/50">
              <p className="text-xs sm:text-sm font-medium mb-2">Select Source:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {sources.map((source, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={activeSource === index ? "default" : "outline"}
                    onClick={() => {
                      setActiveSource(index)
                      if (!isIframeSource && videoRef.current) {
                        videoRef.current.currentTime = currentTime
                      }
                    }}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    {source.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
