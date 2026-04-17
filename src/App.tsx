import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Select from './pages/Select'
import Brands from './pages/Brands'
import Creators from './pages/Creators'
import Forbidden from './pages/Forbidden'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import InviteClaim from './pages/admin/InviteClaim'
import TwoFactorSetupPage from './pages/admin/TwoFactorSetupPage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { rememberRoute } from './hooks/useSmartBack'

function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    rememberRoute(pathname)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<Select />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/invite/:token" element={<InviteClaim />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/setup-2fa"
          element={
            <ProtectedRoute allowPending2FA>
              <TwoFactorSetupPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Forbidden />} />
      </Routes>
    </>
  )
}
