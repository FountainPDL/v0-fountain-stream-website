"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Season {
  season_number: number
  episode_count: number
  name: string
}

interface SeasonEpisodeSelectorProps {
  seasons: Season[]
  currentSeason: number
  currentEpisode: number
  onSelect: (season: number, episode: number) => void
}

export function SeasonEpisodeSelector({
  seasons,
  currentSeason,
  currentEpisode,
  onSelect,
}: SeasonEpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const selectedSeasonData = seasons.find((s) => s.season_number === selectedSeason)
  const episodeCount = selectedSeasonData?.episode_count || 0

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Season</label>
              <Select value={selectedSeason.toString()} onValueChange={(v) => setSelectedSeason(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.season_number} value={season.season_number.toString()}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Episodes</label>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                <Button
                  key={ep}
                  variant={currentSeason === selectedSeason && currentEpisode === ep ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelect(selectedSeason, ep)}
                  className="aspect-square p-0"
                >
                  {ep}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
