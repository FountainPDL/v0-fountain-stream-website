import { type NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"

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

    const contentType = response.headers.get("content-type")

    if (contentType?.includes("zip") || url.endsWith(".zip")) {
      const arrayBuffer = await response.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      // Find the first .srt file in the ZIP
      const srtFile = Object.keys(zip.files).find((filename) => filename.endsWith(".srt"))

      if (!srtFile) {
        return NextResponse.json({ error: "No .srt file found in ZIP archive" }, { status: 400 })
      }

      const content = await zip.files[srtFile].async("text")
      return NextResponse.json({ content })
    }

    // Handle direct .srt files
    const content = await response.text()
    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error downloading subtitle:", error)
    return NextResponse.json({ error: "Failed to download subtitle" }, { status: 500 })
  }
}
