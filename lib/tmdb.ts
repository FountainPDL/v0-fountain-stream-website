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
}

export async function fetchTMDB(endpoint: string) {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export function getImageUrl(path: string | null, size: "w500" | "w780" | "original" = "w500") {
  if (!path) return "/abstract-movie-poster.png"
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function getPopular(page = 1) {
  const data = await fetchTMDB(`/trending/all/week?page=${page}`)
  return data.results as Movie[]
}

export async function getMovies(page = 1) {
  const data = await fetchTMDB(`/movie/popular?page=${page}`)
  return data.results as Movie[]
}

export async function getTVShows(page = 1) {
  const data = await fetchTMDB(`/tv/popular?page=${page}`)
  return data.results as Movie[]
}

export async function getLatest(page = 1) {
  const data = await fetchTMDB(`/trending/all/day?page=${page}`)
  return data.results as Movie[]
}

export async function searchContent(query: string) {
  const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`)
  return data.results as Movie[]
}

export async function getAnime(page = 1) {
  const data = await fetchTMDB(`/discover/tv?with_genres=16&with_keywords=210024&page=${page}`)
  return data.results as Movie[]
}

export async function getPowerRangers(page = 1) {
  const data = await fetchTMDB(`/search/tv?query=power%20rangers&page=${page}`)
  return data.results as Movie[]
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
