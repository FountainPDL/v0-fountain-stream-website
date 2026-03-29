"use client"

import { useEffect } from "react"

export function AdBlocker() {
  useEffect(() => {
    const blockAds = () => {
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
        "adnxs.com",
        "criteo.com",
        "rubiconproject.com",
        "openx.net",
        "pubmatic.com",
        "appnexus.com",
        "ads-",
        "ad-server",
        "advert",
        "advertising",
      ]

      // Block popups and redirects
      const originalOpen = window.open
      ;(window as any).open = function (url: string, ...args: any[]) {
        if (!url || adDomains.some((domain) => url.includes(domain))) {
          return null
        }
        return originalOpen.call(window, url, ...args)
      }

      // Block navigate/location changes to ad domains
      const originalReplace = window.location.replace
      ;(window.location as any).replace = function (url: string) {
        if (url && adDomains.some((domain) => url.includes(domain))) {
          console.log("[AdBlocker] Blocked redirect to:", url)
          return
        }
        return originalReplace.call(window.location, url)
      }

      const originalAssign = window.location.assign
      ;(window.location as any).assign = function (url: string) {
        if (url && adDomains.some((domain) => url.includes(domain))) {
          console.log("[AdBlocker] Blocked navigation to:", url)
          return
        }
        return originalAssign.call(window.location, url)
      }

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
          return
        }
        return originalXHR.apply(this, [method, url, ...rest])
      }

      // Block specific ad iframes
      const originalIframeDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src")
      if (originalIframeDescriptor) {
        Object.defineProperty(HTMLIFrameElement.prototype, "src", {
          set(value: string) {
            if (!adDomains.some((domain) => value.includes(domain))) {
              originalIframeDescriptor.set?.call(this, value)
            }
          },
          get() {
            return originalIframeDescriptor.get?.call(this)
          },
        })
      }

      // Remove ad-related iframes and scripts
      const removeAds = () => {
        const adSelectors = [
          'iframe[src*="doubleclick"]',
          'iframe[src*="googlesyndication"]',
          'iframe[src*="pagead"]',
          'iframe[src*="adservice"]',
          'iframe[src*="ads.google"]',
          'iframe[src*="criteo"]',
          'iframe[src*="rubiconproject"]',
          'iframe[src*="ads-"]',
          'iframe[src*="ad-server"]',
          'script[src*="doubleclick"]',
          'script[src*="googlesyndication"]',
          'script[src*="google-analytics"]',
          'script[src*="analytics.google"]',
          'script[src*="facebook.com/tr"]',
          'script[src*="connect.facebook"]',
          'script[src*="adbygoogle"]',
          '[data-ad-format]',
          '[class*="advertisement"]',
          '[class*="ad-banner"]',
          '[class*="ad-container"]',
        ]

        adSelectors.forEach((selector) => {
          try {
            document.querySelectorAll(selector).forEach((el) => {
              el.remove()
            })
          } catch {
            // Skip invalid selectors
          }
        })
      }

      // Run ad removal on page load and periodically
      removeAds()
      const interval = setInterval(removeAds, 3000)

      return () => clearInterval(interval)
    }

    blockAds()
  }, [])

  return null
}
