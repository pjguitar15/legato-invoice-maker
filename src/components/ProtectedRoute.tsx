import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/session', { signal: controller.signal })
      .then((response) => setAuthenticated(response.ok))
      .catch(() => {
        if (!controller.signal.aborted) setAuthenticated(false)
      })
    return () => controller.abort()
  }, [])

  if (authenticated === null) return null
  return authenticated ? <>{children}</> : <Navigate to='/login' replace />
}
