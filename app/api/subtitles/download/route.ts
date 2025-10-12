import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    const downloadUrl = `https://dl.subdl.com${url}`
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error("Failed to download subtitle")
    }

    // Check if it's a zip file
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("zip")) {
      // For zip files, we'll need to extract the SRT file
      // For now, return an error asking user to download manually
      return NextResponse.json({ error: "Zip files need to be extracted. Please download manually." }, { status: 400 })
    }

    const content = await response.text()
    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error downloading subtitle:", error)
    return NextResponse.json({ error: "Failed to download subtitle" }, { status: 500 })
  }
}
