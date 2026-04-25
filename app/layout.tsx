import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { AdBlocker } from "@/components/ad-blocker"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "FountainHome - Stream Movies, TV Shows & Anime",
  description: "Your ultimate streaming destination with a cyber fountain experience",
  generator: "v0.app",
  icons: {
    icon: [{ url: "/fountain-icon.jpg", type: "image/jpeg", sizes: "any" }],
    shortcut: "/fountain-icon.jpg",
    apple: [{ url: "/fountain-icon.jpg", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FountainHome",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AdBlocker />
          <Suspense fallback={<LoadingSpinner />}>
            <Header />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-border/50 bg-card/50 py-4 text-center">
            <p className="text-sm text-muted-foreground">Made with love for movie lovers</p>
          </footer>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
