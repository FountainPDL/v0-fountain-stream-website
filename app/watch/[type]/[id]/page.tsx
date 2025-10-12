import { notFound } from "next/navigation"
import { Star, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { VideoPlayer } from "@/components/video-player"
import { CastSection } from "@/components/cast-section"
import { RelatedContent } from "@/components/related-content"
import { CommentsSection } from "@/components/comments-section"
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
  const [details, credits, similar] = await Promise.all([
    type === "movie" ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
    type === "movie" ? getMovieCredits(tmdbId) : getTVCredits(tmdbId),
    type === "movie" ? getSimilarMovies(tmdbId) : getSimilarTV(tmdbId),
  ])

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date
  const runtime = details.runtime || details.episode_run_time?.[0]
  const genres = details.genres || []
  const cast = credits.cast || []

  // For TV shows, get seasons
  const seasons = type === "tv" ? details.seasons?.filter((s: any) => s.season_number > 0) || [] : []
  const currentSeason = season ? Number.parseInt(season) : 1
  const currentEpisode = episode ? Number.parseInt(episode) : 1

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8 space-y-8">
        {/* Video Player */}
        <VideoPlayer
          mediaType={type}
          tmdbId={tmdbId}
          imdbId={details.imdb_id}
          season={type === "tv" ? currentSeason : undefined}
          episode={type === "tv" ? currentEpisode : undefined}
          title={title}
          posterPath={details.poster_path}
        />

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
