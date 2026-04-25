"use client"

import { useEffect } from "react"

export function AdBlocker() {
  useEffect(() => {
    // Light ad blocking - block common ad network requests and popups
    const blockAds = () => {
      const adDomains = [
        "doubleclick.net",
        "googlesyndication.com",
        "pagead2.googlesyndication.com",
        "google-analytics.com",
        "analytics.google.com",
      ]

      // Block popups and unwanted redirects
      const originalOpen = window.open
      ;(window as any).open = function (url: string, ...args: any[]) {
        if (!url || adDomains.some((domain) => url.includes(domain))) {
          return null
        }
        return originalOpen.call(window, url, ...args)
      }

      // Block location redirects to ad domains
      const originalReplace = window.location.replace
      ;(window.location as any).replace = function (url: string) {
        if (url && adDomains.some((domain) => url.includes(domain))) {
          return
        }
        return originalReplace.call(window.location, url)
      }

      const originalAssign = window.location.assign
      ;(window.location as any).assign = function (url: string) {
        if (url && adDomains.some((domain) => url.includes(domain))) {
          return
        }
        return originalAssign.call(window.location, url)
      }

      // Block fetch requests to ad networks
      const originalFetch = window.fetch
      ;(window as any).fetch = function (...args: any[]) {
        const url = args[0]?.toString?.() || ""
        if (adDomains.some((domain) => url.includes(domain))) {
          return Promise.reject(new Error("Ad blocked"))
        }
        return originalFetch.apply(this, args)
      }
    }

    blockAds()
  }, [])

  return null
}
