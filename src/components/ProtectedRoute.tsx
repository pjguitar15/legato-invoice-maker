import { Navigate, type ReactNode } from 'react-router'

const AUTH_KEY = 'legato-auth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true'
  return isLoggedIn ? <>{children}</> : <Navigate to='/login' replace />
}
