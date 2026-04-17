import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Select from './pages/Select'
import Brands from './pages/Brands'
import Creators from './pages/Creators'
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'
import HoneypotAdmin from './pages/HoneypotAdmin'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import InviteClaim from './pages/admin/InviteClaim'
import TwoFactorSetupPage from './pages/admin/TwoFactorSetupPage'
import FeedbackPage from './pages/FeedbackPage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import FeedbackWidget from './components/FeedbackWidget'
import { useAdminAuth } from './hooks/useAdminAuth'
import { rememberRoute } from './hooks/useSmartBack'
import { ADMIN_SLUG, HONEYPOT_PATHS } from './config/security'
import { showConsoleWarning } from './lib/security'

function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    rememberRoute(pathname)
  }, [pathname])
  return null
}

function BootSecurity() {
  useEffect(() => {
    showConsoleWarning()
  }, [])
  return null
}

function GlobalFeedbackWidget() {
  const { profile, isFeedbackUser } = useAdminAuth()
  if (!isFeedbackUser || !profile) return null
  return <FeedbackWidget userEmail={profile.email} userName={profile.display_name} />
}

export default function App() {
  return (
    <>
      <BootSecurity />
      <RouteTracker />
      <GlobalFeedbackWidget />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<Select />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/creators" element={<Creators />} />

        {/* Error pages */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />

        {/* Invite claim (accepted anywhere) */}
        <Route path="/invite/:token" element={<InviteClaim />} />

        {/* Feedback page (feedback users) */}
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        {/* ─── SECRET ADMIN AREA — path is env-configurable ─── */}
        <Route path={`/${ADMIN_SLUG}`} element={<AdminLogin />} />
        <Route
          path={`/${ADMIN_SLUG}/dashboard`}
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={`/${ADMIN_SLUG}/settings`}
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={`/${ADMIN_SLUG}/setup-2fa`}
          element={
            <ProtectedRoute allowPending2FA>
              <TwoFactorSetupPage />
            </ProtectedRoute>
          }
        />

        {/* ─── HONEYPOTS — decoys for common admin-hunting bots ─── */}
        {HONEYPOT_PATHS.map((p) => (
          <Route key={p} path={p} element={<HoneypotAdmin />} />
        ))}
        {HONEYPOT_PATHS.map((p) => (
          <Route key={`${p}/*`} path={`${p}/*`} element={<HoneypotAdmin />} />
        ))}

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
