import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tmdbId = searchParams.get("tmdb_id")
  const type = searchParams.get("type")
  const season = searchParams.get("season")
  const episode = searchParams.get("episode")

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    // Build the SubDL API URL
    const params = new URLSearchParams({
      api_key: process.env.SUBDL_API_KEY || "demo-api-key",
      tmdb_id: tmdbId,
      type: type,
      languages: "EN,ES,FR,DE,IT,PT,AR,ZH,JA,KO,RU,HI,TR,NL,PL,SV,DA,NO,FI",
      subs_per_page: "30",
    })

    if (season) params.append("season_number", season)
    if (episode) params.append("episode_number", episode)

    const response = await fetch(`https://api.subdl.com/api/v1/subtitles?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch subtitles")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Subtitle API error:", error)
    return NextResponse.json({ error: "Failed to fetch subtitles" }, { status: 500 })
  }
}
