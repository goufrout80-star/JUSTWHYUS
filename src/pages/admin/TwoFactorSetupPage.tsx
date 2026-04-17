import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { signOut } from '../../lib/supabase'
import TwoFactorSetup from '../../components/admin/TwoFactorSetup'
import { ADMIN_BASE, ADMIN_DASHBOARD, ADMIN_SETTINGS } from '../../config/security'
import LogoMark from '../../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'

export default function TwoFactorSetupPage() {
  useDocumentHead({ title: 'Enable 2FA — JUST WHY US', noIndex: true })
  const navigate = useNavigate()
  const { profile, mfaEnforced, refresh } = useAdminAuth()

  const handleDone = async () => {
    await refresh()
    navigate(ADMIN_DASHBOARD)
  }

  const handleCancel = async () => {
    // If 2FA is enforced, cancel = sign out. Otherwise just go back.
    if (mfaEnforced) {
      await signOut()
      navigate(ADMIN_BASE)
    } else {
      navigate(ADMIN_SETTINGS)
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: VOID,
        color: CREAM,
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <LogoMark size={28} />
        <span
          className="font-brand"
          style={{ fontSize: 14, color: TEAL, letterSpacing: '0.2em' }}
        >
          ADMIN
        </span>
      </div>

      {mfaEnforced && (
        <div
          style={{
            maxWidth: 460,
            marginBottom: 20,
            padding: 14,
            borderRadius: 6,
            backgroundColor: 'rgba(255,92,56,0.08)',
            border: '1px solid rgba(255,92,56,0.25)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#FF9E82',
          }}
        >
          Your admin requires 2FA to access the dashboard. Please enroll to continue.
        </div>
      )}

      {profile && (
        <TwoFactorSetup
          adminEmail={profile.email}
          onComplete={handleDone}
          onCancel={handleCancel}
        />
      )}
    </main>
  )
}
