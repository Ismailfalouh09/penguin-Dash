import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query. SSR-safe and returns `false` until mounted.
 * Used to coordinate the desktop sidebar vs. the mobile drawer.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** True at Tailwind's `lg` breakpoint (1024px) and up. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
