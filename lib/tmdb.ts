const TMDB_API_KEY = process.env.TMDB_API_KEY || "8baba8ab6b8bbe247645bcae7df63d0d"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: "movie" | "tv"
  certification?: string
  adult?: boolean
  genre_ids?: number[]
}

export async function fetchTMDB(endpoint: string) {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  try {
    console.log("[v0] Fetching TMDB:", url.replace(TMDB_API_KEY, "***"))
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      cache: "force-cache",
    })

    if (!response.ok) {
      console.error("[v0] TMDB API error:", response.status, response.statusText)
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] TMDB fetch successful")
    return data
  } catch (error) {
    console.error("[v0] TMDB fetch failed:", error)
    throw error
  }
}

export function getImageUrl(path: string | null, size: "w500" | "w780" | "original" = "w500") {
  if (!path) return "/abstract-movie-poster.png"
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function getPopular(page = 1) {
  try {
    const data = await fetchTMDB(`/trending/all/week?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getPopular failed:", error)
    return []
  }
}

export async function getMovies(page = 1) {
  try {
    const data = await fetchTMDB(`/movie/popular?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getMovies failed:", error)
    return []
  }
}

export async function getTVShows(page = 1) {
  try {
    const data = await fetchTMDB(`/tv/popular?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getTVShows failed:", error)
    return []
  }
}

export async function getLatest(page = 1) {
  try {
    const data = await fetchTMDB(`/trending/all/day?page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getLatest failed:", error)
    return []
  }
}

export async function searchContent(query: string) {
  try {
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] searchContent failed:", error)
    return []
  }
}

export async function getAnime(page = 1) {
  try {
    const data = await fetchTMDB(`/discover/tv?with_genres=16&with_keywords=210024&page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getAnime failed:", error)
    return []
  }
}

export async function getPowerRangers(page = 1) {
  try {
    const data = await fetchTMDB(`/search/tv?query=power%20rangers&page=${page}`)
    return data.results as Movie[]
  } catch (error) {
    console.error("[v0] getPowerRangers failed:", error)
    return []
  }
}

export async function getMovieDetails(id: number) {
  const data = await fetchTMDB(`/movie/${id}?append_to_response=videos`)
  return data
}

export async function getTVDetails(id: number) {
  const data = await fetchTMDB(`/tv/${id}?append_to_response=videos`)
  return data
}

export async function getMovieCredits(id: number) {
  const data = await fetchTMDB(`/movie/${id}/credits`)
  return data
}

export async function getTVCredits(id: number) {
  const data = await fetchTMDB(`/tv/${id}/credits`)
  return data
}

export async function getSimilarMovies(id: number) {
  const data = await fetchTMDB(`/movie/${id}/similar`)
  return data.results as Movie[]
}

export async function getSimilarTV(id: number) {
  const data = await fetchTMDB(`/tv/${id}/similar`)
  return data.results as Movie[]
}

export async function getTVSeasons(id: number) {
  const data = await fetchTMDB(`/tv/${id}`)
  return data.seasons || []
}

export async function getMovieCertification(id: number): Promise<string> {
  try {
    const data = await fetchTMDB(`/movie/${id}/release_dates`)
    const usRelease = data.results?.find((r: any) => r.iso_3166_1 === "US")
    if (usRelease?.release_dates?.[0]?.certification) {
      return usRelease.release_dates[0].certification
    }
  } catch (error) {
    console.error("Error fetching movie certification:", error)
  }
  return ""
}

export async function getTVContentRating(id: number): Promise<string> {
  try {
    const data = await fetchTMDB(`/tv/${id}/content_ratings`)
    const usRating = data.results?.find((r: any) => r.iso_3166_1 === "US")
    if (usRating?.rating) {
      return usRating.rating
    }
  } catch (error) {
    console.error("Error fetching TV content rating:", error)
  }
  return ""
}

export function isAdultContent(movie: Movie, certification?: string): boolean {
  // Check explicit adult flag
  if (movie.adult) return true

  // Check certification/rating
  if (certification) {
    const adultRatings = ["R", "NC-17", "X", "TV-MA", "TV-18", "18", "18+"]
    return adultRatings.includes(certification.toUpperCase())
  }

  return false
}

export function filterAdultContentIfNeeded(movies: Movie[], filterEnabled: boolean): Movie[] {
  if (!filterEnabled) return movies

  return movies.filter((movie) => {
    // Filter out explicitly adult content
    if (movie.adult) return false

    // Filter based on certification if available
    if (movie.certification) {
      return !isAdultContent(movie, movie.certification)
    }

    return true
  })
}
