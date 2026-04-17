import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ADMIN_BASE, ADMIN_SETUP_2FA } from '../../config/security'

interface Props {
  children: React.ReactNode
  /**
   * When true, allow entering even when the user still needs to enroll 2FA.
   * Used by the /admin/setup-2fa page so it doesn't redirect to itself.
   */
  allowPending2FA?: boolean
}

export default function ProtectedRoute({ children, allowPending2FA }: Props) {
  const location = useLocation()
  const { session, isAdmin, mfaPending, mfaChallengeRequired, loading } = useAdminAuth()

  if (loading) {
    return (
      <div
        style={{
          height: '100dvh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid rgba(43,219,164,0.15)',
            borderTopColor: '#2BDBA4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!session) {
    return <Navigate to={ADMIN_BASE} replace />
  }

  // Logged in but not in admins table → 403
  if (!isAdmin) {
    return <Navigate to="/403" replace />
  }

  // 2FA challenge required (has factor, session still aal1) → back to login for challenge
  if (mfaChallengeRequired) {
    return <Navigate to={`${ADMIN_BASE}?mfa=1`} replace />
  }

  // 2FA enrollment pending (required but not yet set up) → setup page
  if (mfaPending && !allowPending2FA && location.pathname !== ADMIN_SETUP_2FA) {
    return <Navigate to={ADMIN_SETUP_2FA} replace />
  }

  return <>{children}</>
}
