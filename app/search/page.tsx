import { searchContent } from "@/lib/tmdb"
import { SearchResults } from "@/components/search-results"
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
        <SearchResults movies={results} />
      )}
    </div>
  )
}
