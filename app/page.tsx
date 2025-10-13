import { HeroBanner } from "@/components/hero-banner"
import { CategoryTabs } from "@/components/category-tabs"
import { ContinueWatching } from "@/components/continue-watching"
import { getPopular, getLatest, getMovies, getTVShows, getAnime, getPowerRangers } from "@/lib/tmdb"

export default async function HomePage() {
  let popular, latest, movies, tvShows, anime, powerRangers

  try {
    // Fetch all categories in parallel
    ;[popular, latest, movies, tvShows, anime, powerRangers] = await Promise.all([
      getPopular(),
      getLatest(),
      getMovies(),
      getTVShows(),
      getAnime(),
      getPowerRangers(),
    ])
  } catch (error) {
    console.error("[v0] Failed to fetch TMDB data:", error)
    // Provide empty arrays as fallback
    popular = []
    latest = []
    movies = []
    tvShows = []
    anime = []
    powerRangers = []
  }

  return (
    <div className="min-h-screen">
      {popular.length > 0 && <HeroBanner movies={popular.slice(0, 5)} />}
      <div className="container px-4 py-8">
        <ContinueWatching />
      </div>
      <CategoryTabs
        popular={popular}
        latest={latest}
        movies={movies}
        tvShows={tvShows}
        anime={anime}
        powerRangers={powerRangers}
      />
    </div>
  )
}
