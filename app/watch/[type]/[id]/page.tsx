import { notFound } from "next/navigation"
import { Star, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EnhancedPlayer } from "@/components/enhanced-player"
import { SubtitleSelector } from "@/components/subtitle-selector"
import { CastSection } from "@/components/cast-section"
import { RelatedContent } from "@/components/related-content"
import { CommentsSection } from "@/components/comments-section"
import { DownloadButton } from "@/components/download-button"
import {
  getMovieDetails,
  getTVDetails,
  getMovieCredits,
  getTVCredits,
  getSimilarMovies,
  getSimilarTV,
} from "@/lib/tmdb"

interface WatchPageProps {
  params: Promise<{
    type: string
    id: string
  }>
  searchParams: Promise<{
    season?: string
    episode?: string
  }>
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { type, id } = await params
  const { season, episode } = await searchParams

  if (type !== "movie" && type !== "tv") {
    notFound()
  }

  const tmdbId = Number.parseInt(id)
  if (Number.isNaN(tmdbId)) {
    notFound()
  }

  // Fetch data in parallel
  let details, credits, similar
  try {
    const results = await Promise.all([
      type === "movie" ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
      type === "movie" ? getMovieCredits(tmdbId) : getTVCredits(tmdbId),
      type === "movie" ? getSimilarMovies(tmdbId) : getSimilarTV(tmdbId),
    ])
    details = results[0]
    credits = results[1]
    similar = results[2]
  } catch (error) {
    // If the movie/TV show doesn't exist or any fetch fails, show 404 page
    notFound()
  }

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date
  const runtime = details.runtime || details.episode_run_time?.[0]
  const genres = details.genres || []
  const cast = credits.cast || []

  // For TV shows, get seasons
  const seasons = type === "tv" ? details.seasons?.filter((s: any) => s.season_number > 0) || [] : []
  const currentSeason = season ? Number.parseInt(season) : 1
  const currentEpisode = episode ? Number.parseInt(episode) : 1

  const currentSeasonData = seasons.find((s: any) => s.season_number === currentSeason)
  const hasNextEpisode = currentEpisode < (currentSeasonData?.episode_count || 0)
  const hasPreviousEpisode = currentEpisode > 1 || currentSeason > 1

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8 space-y-8">
        <EnhancedPlayer
          sources={[
            { url: `https://vidsrc.to/embed/movie/${details.imdb_id}`, type: "text/html", label: "VidSrc" },
            { url: `https://2embed.cc/embed/${details.imdb_id}`, type: "text/html", label: "2Embed" },
            { url: `https://autoembed.cc/embed/imdb/${details.imdb_id}`, type: "text/html", label: "AutoEmbed" },
          ]}
          title={title}
          posterPath={details.poster_path}
          mediaType={type}
          tmdbId={tmdbId}
          season={type === "tv" ? currentSeason : undefined}
          episode={type === "tv" ? currentEpisode : undefined}
          onNextEpisode={() => {
            if (hasNextEpisode) {
              window.location.href = `/watch/tv/${tmdbId}?season=${currentSeason}&episode=${currentEpisode + 1}`
            }
          }}
          onPreviousEpisode={() => {
            if (currentEpisode > 1) {
              window.location.href = `/watch/tv/${tmdbId}?season=${currentSeason}&episode=${currentEpisode - 1}`
            } else if (currentSeason > 1) {
              const prevSeason = seasons.find((s: any) => s.season_number === currentSeason - 1)
              if (prevSeason) {
                window.location.href = `/watch/tv/${tmdbId}?season=${currentSeason - 1}&episode=${prevSeason.episode_count}`
              }
            }
          }}
          hasNextEpisode={hasNextEpisode}
          hasPreviousEpisode={hasPreviousEpisode}
        />

        {/* Subtitle Selector */}
        <SubtitleSelector
          mediaType={type}
          tmdbId={tmdbId}
          season={type === "tv" ? currentSeason : undefined}
          episode={type === "tv" ? currentEpisode : undefined}
        />

        {/* Download Button */}
        <div className="flex justify-center">
          <DownloadButton
            mediaType={type}
            tmdbId={tmdbId}
            imdbId={details.imdb_id}
            season={type === "tv" ? currentSeason : undefined}
            episode={type === "tv" ? currentEpisode : undefined}
            title={title}
          />
        </div>

        {/* TV Show Episode Selector */}
        {type === "tv" && seasons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            <div className="space-y-4">
              {seasons.map((season: any) => (
                <Card key={season.season_number} className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{season.name}</h3>
                      <Badge variant="outline">{season.episode_count} Episodes</Badge>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2">
                      {Array.from({ length: season.episode_count }, (_, i) => i + 1).map((ep) => (
                        <a
                          key={ep}
                          href={`/watch/tv/${tmdbId}?season=${season.season_number}&episode=${ep}`}
                          className={`aspect-square flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                            currentSeason === season.season_number && currentEpisode === ep
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 hover:bg-muted border-border/50"
                          }`}
                        >
                          {ep}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Details Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {details.vote_average && (
                  <Badge variant="secondary" className="text-sm">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {details.vote_average.toFixed(1)}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(releaseDate).getFullYear()}
                  </Badge>
                )}
                {runtime && (
                  <Badge variant="outline" className="text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {runtime} min
                  </Badge>
                )}
              </div>
            </div>

            {genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">{details.overview}</p>
            </div>

            {details.tagline && (
              <div>
                <p className="text-sm italic text-muted-foreground">"{details.tagline}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cast Section */}
        {cast.length > 0 && <CastSection cast={cast} />}

        {/* Comments Section */}
        <CommentsSection contentId={tmdbId.toString()} contentType={type} />

        {/* Related Content */}
        {similar.length > 0 && <RelatedContent movies={similar} title="You May Also Like" />}
      </div>
    </div>
  )
}
