import { notFound } from "next/navigation"
import { Star, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { VideoPlayerNew } from "@/components/video-player-new"
import { CastSection } from "@/components/cast-section"
import { RelatedContent } from "@/components/related-content"
import { CommentsSection } from "@/components/comments-section"
import { SeasonEpisodeSelector } from "@/components/season-episode-selector"
import {
  getMovieDetails,
  getTVDetails,
  getMovieCredits,
  getTVCredits,
  getSimilarMovies,
  getSimilarTV,
} from "@/lib/tmdb"

interface WatchPageProps {
  params: {
    type: string
    id: string
    slug?: string
  }
  searchParams: {
    season?: string
    episode?: string
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { type, id } = params
  const { season, episode } = searchParams

  if (type !== "movie" && type !== "tv") {
    notFound()
  }

  const idMatch = id.match(/^(\d+)/)
  const tmdbId = idMatch ? Number.parseInt(idMatch[1]) : Number.parseInt(id)

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
    notFound()
  }

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date
  const runtime = details.runtime || details.episode_run_time?.[0]
  const genres = details.genres || []
  const cast = credits.cast || []

  const normalizedSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // For TV shows, get seasons
  const seasons = type === "tv" ? details.seasons?.filter((s: any) => s.season_number > 0) || [] : []
  const currentSeason = season ? Number.parseInt(season) : 1
  const currentEpisode = episode ? Number.parseInt(episode) : 1

  const currentSeasonData = seasons.find((s: any) => s.season_number === currentSeason)
  const hasNextEpisode = currentEpisode < (currentSeasonData?.episode_count || 0)
  const hasPreviousEpisode = currentEpisode > 1 || currentSeason > 1

  const movieSources = details.imdb_id
    ? [
        { url: `https://vidsrc.xyz/embed/movie/${details.imdb_id}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embed/${details.imdb_id}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/movie/imdb/${details.imdb_id}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${details.imdb_id}`, type: "text/html", label: "SuperEmbed" },
      ]
    : [
        { url: `https://vidsrc.xyz/embed/movie/${tmdbId}`, type: "text/html", label: "VidSrc" },
        { url: `https://www.2embed.cc/embed/tmdb/movie?id=${tmdbId}`, type: "text/html", label: "2Embed" },
        { url: `https://autoembed.cc/movie/tmdb/${tmdbId}`, type: "text/html", label: "AutoEmbed" },
        { url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`, type: "text/html", label: "SuperEmbed" },
      ]

  const tvSources = details.imdb_id
    ? [
        {
          url: `https://vidsrc.xyz/embed/tv/${details.imdb_id}/${currentSeason}/${currentEpisode}`,
          type: "text/html",
          label: "VidSrc",
        },
        {
          url: `https://www.2embed.cc/embedtv/${details.imdb_id}&s=${currentSeason}&e=${currentEpisode}`,
          type: "text/html",
          label: "2Embed",
        },
        {
          url: `https://autoembed.cc/tv/imdb/${details.imdb_id}/${currentSeason}/${currentEpisode}`,
          type: "text/html",
          label: "AutoEmbed",
        },
        {
          url: `https://multiembed.mov/?video_id=${details.imdb_id}&s=${currentSeason}&e=${currentEpisode}`,
          type: "text/html",
          label: "SuperEmbed",
        },
      ]
    : [
        {
          url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}`,
          type: "text/html",
          label: "VidSrc",
        },
        {
          url: `https://www.2embed.cc/embedtv/tmdb/tv?id=${tmdbId}&s=${currentSeason}&e=${currentEpisode}`,
          type: "text/html",
          label: "2Embed",
        },
        {
          url: `https://autoembed.cc/tv/tmdb/${tmdbId}/${currentSeason}/${currentEpisode}`,
          type: "text/html",
          label: "AutoEmbed",
        },
        {
          url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${currentSeason}&e=${currentEpisode}`,
          type: "text/html",
          label: "SuperEmbed",
        },
      ]

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8 space-y-8">
        <VideoPlayerNew
          sources={type === "movie" ? movieSources : tvSources}
          title={title}
          posterPath={details.poster_path}
          mediaType={type}
          tmdbId={tmdbId}
          season={type === "tv" ? currentSeason : undefined}
          episode={type === "tv" ? currentEpisode : undefined}
          hasNextEpisode={hasNextEpisode}
          hasPreviousEpisode={hasPreviousEpisode}
          nextEpisodeUrl={
            hasNextEpisode
              ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason}&episode=${currentEpisode + 1}`
              : undefined
          }
          previousEpisodeUrl={
            currentEpisode > 1
              ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason}&episode=${currentEpisode - 1}`
              : currentSeason > 1
                ? (() => {
                    const prevSeason = seasons.find((s: any) => s.season_number === currentSeason - 1)
                    return prevSeason
                      ? `/watch/tv/${tmdbId}-${normalizedSlug}?season=${currentSeason - 1}&episode=${prevSeason.episode_count}`
                      : undefined
                  })()
                : undefined
          }
        />

        {/* TV Show Season & Episode Selector - DROPDOWN MENU */}
        {type === "tv" && seasons.length > 0 && (
          <SeasonEpisodeSelector
            seasons={seasons}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            tmdbId={tmdbId}
            slug={normalizedSlug}
          />
        )}

        {/* Movie Parts Selector */}
        {type === "movie" && details.parts && details.parts.length > 1 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Movie Parts</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {details.parts.map((part: any, index: number) => (
                    <a
                      key={part.id}
                      href={`/watch/movie/${part.id}-${normalizedSlug}`}
                      className={`aspect-square flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                        tmdbId === part.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted border-border/50"
                      }`}
                    >
                      {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
