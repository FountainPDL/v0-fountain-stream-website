"use client"

import { useState, useEffect } from "react"
import { type SubtitleCue, getCurrentCue } from "@/lib/subtitle-parser"

interface SubtitleOverlayProps {
  cues: SubtitleCue[]
  currentTime: number
  enabled: boolean
}

export function SubtitleOverlay({ cues, currentTime, enabled }: SubtitleOverlayProps) {
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null)

  useEffect(() => {
    if (enabled && cues.length > 0) {
      const cue = getCurrentCue(cues, currentTime)
      setCurrentCue(cue)
    } else {
      setCurrentCue(null)
    }
  }, [currentTime, cues, enabled])

  if (!enabled || !currentCue) return null

  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
      <div
        className="bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-4xl backdrop-blur-sm"
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          fontSize: "1.1rem",
          lineHeight: "1.4",
        }}
      >
        {currentCue.text.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  )
}
