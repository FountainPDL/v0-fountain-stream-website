"use client"

import { useEffect } from "react"

export function AdBlocker() {
  useEffect(() => {
    const blockAds = () => {
      // Block ad-related domains
      const adDomains = [
        "doubleclick.net",
        "googlesyndication.com",
        "pagead2.googlesyndication.com",
        "adservice.google.com",
        "ads.google.com",
        "googleadservices.com",
        "google-analytics.com",
        "analytics.google.com",
        "facebook.com/tr",
        "connect.facebook.net",
        "platform.twitter.com",
        "cdn.syndication.twimg.com",
        "ads.twitter.com",
      ]

      // Block scripts from ad networks
      const originalFetch = window.fetch
      ;(window as any).fetch = function (...args: any[]) {
        const url = args[0]?.toString?.() || ""
        if (adDomains.some((domain) => url.includes(domain))) {
          return Promise.reject(new Error("Ad blocked"))
        }
        return originalFetch.apply(this, args)
      }

      // Block XMLHttpRequest to ad networks
      const originalXHR = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function (method: string, url: string, ...rest: any[]) {
        if (adDomains.some((domain) => url.includes(domain))) {
          console.log("[v0] Blocked ad request:", url)
          return
        }
        return originalXHR.apply(this, [method, url, ...rest])
      }

      // Remove ad-related iframes and scripts
      const removeAds = () => {
        const adSelectors = [
          'iframe[src*="doubleclick"]',
          'iframe[src*="googlesyndication"]',
          'iframe[src*="pagead"]',
          'iframe[src*="adservice"]',
          'script[src*="doubleclick"]',
          'script[src*="googlesyndication"]',
          'script[src*="google-analytics"]',
          'script[src*="analytics.google"]',
        ]

        adSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            el.remove()
          })
        })
      }

      // Run ad removal on page load and periodically
      removeAds()
      const interval = setInterval(removeAds, 5000)

      return () => clearInterval(interval)
    }

    blockAds()
  }, [])

  return null
}
