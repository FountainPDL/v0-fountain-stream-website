"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CategorySection } from "./category-section"
import type { Movie } from "@/lib/tmdb"

interface CategoryTabsProps {
  popular: Movie[]
  latest: Movie[]
  movies: Movie[]
  tvShows: Movie[]
  anime: Movie[]
  powerRangers: Movie[]
}

export function CategoryTabs({ popular, latest, movies, tvShows, anime, powerRangers }: CategoryTabsProps) {
  const [activeTab, setActiveTab] = useState("popular")

  return (
    <div className="container px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Popular
          </TabsTrigger>
          <TabsTrigger
            value="latest"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Latest
          </TabsTrigger>
          <TabsTrigger
            value="movies"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Movies
          </TabsTrigger>
          <TabsTrigger
            value="tv"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            TV Shows
          </TabsTrigger>
          <TabsTrigger
            value="anime"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Anime
          </TabsTrigger>
          <TabsTrigger
            value="power-rangers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Power Rangers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="mt-6">
          <CategorySection title="Trending This Week" movies={popular} />
        </TabsContent>

        <TabsContent value="latest" className="mt-6">
          <CategorySection title="Latest Releases" movies={latest} />
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <CategorySection title="Popular Movies" movies={movies} />
        </TabsContent>

        <TabsContent value="tv" className="mt-6">
          <CategorySection title="Popular TV Shows" movies={tvShows} />
        </TabsContent>

        <TabsContent value="anime" className="mt-6">
          <CategorySection title="Anime Collection" movies={anime} />
        </TabsContent>

        <TabsContent value="power-rangers" className="mt-6">
          <CategorySection title="Power Rangers" movies={powerRangers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
