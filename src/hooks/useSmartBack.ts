import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const LAST_KEY = 'jwu_last_route'

export function rememberRoute(path: string) {
  try {
    // Don't remember auth/error routes as "the place to go back to"
    if (
      path.startsWith('/admin') ||
      path.startsWith('/invite') ||
      path === '/403'
    ) {
      return
    }
    sessionStorage.setItem(LAST_KEY, path)
  } catch {
    /* ignore */
  }
}

export function useSmartBack() {
  const navigate = useNavigate()
  return useCallback(() => {
    let last: string | null = null
    try {
      last = sessionStorage.getItem(LAST_KEY)
    } catch {
      last = null
    }

    // Prefer the stored safe route if we have one
    if (last && last !== window.location.pathname) {
      navigate(last)
      return
    }

    // Fall back to history.back if same-origin
    if (
      window.history.length > 1 &&
      (!document.referrer || document.referrer.startsWith(window.location.origin))
    ) {
      navigate(-1)
      return
    }

    navigate('/')
  }, [navigate])
}
