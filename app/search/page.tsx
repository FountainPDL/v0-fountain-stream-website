import { searchContent } from "@/lib/tmdb"
import { MovieCard } from "@/components/movie-card"
import { ContentFilter } from "@/components/content-filter"
import { Search } from "lucide-react"

interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const results = query ? await searchContent(query) : []

  return (
    <div className="container px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Search Results</h1>
        {query && (
          <p className="text-muted-foreground">
            Found {results.length} results for "{query}"
          </p>
        )}
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No search query</h2>
          <p className="text-muted-foreground">Use the search bar above to find movies, TV shows, and anime</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground">Try searching with different keywords</p>
        </div>
      ) : (
        <ContentFilter movies={results}>
          {(filteredMovies) => (
            <>
              {filteredMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold text-muted-foreground mb-2">No results after filtering</h2>
                  <p className="text-muted-foreground">
                    Adult content filter is enabled. Disable it in settings to see all results.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
                  ))}
                </div>
              )}
            </>
          )}
        </ContentFilter>
      )}
    </div>
  )
}
