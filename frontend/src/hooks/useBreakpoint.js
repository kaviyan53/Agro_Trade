import { useEffect, useState } from 'react'

const getBreakpoint = () => {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  if (width < 1440) return 'laptop'
  if (width < 1920) return 'desktop'
  return 'tv'
}

export default function useBreakpoint(delay = 120) {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint)

  useEffect(() => {
    let timeoutId

    const updateBreakpoint = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        setBreakpoint(getBreakpoint())
      }, delay)
    }

    window.addEventListener('resize', updateBreakpoint)
    setBreakpoint(getBreakpoint())

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [delay])

  return breakpoint
}
