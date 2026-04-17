import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/supabase'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useAdminData } from '../../hooks/useAdminData'
import LogoMark from '../../components/ui/LogoMark'
import StatCard from '../../components/admin/StatCard'
import BrandRequestsTable from '../../components/admin/BrandRequestsTable'
import CreatorApplicationsTable from '../../components/admin/CreatorApplicationsTable'
import TeamPanel from '../../components/admin/TeamPanel'
import ActivityPanel from '../../components/admin/ActivityPanel'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { ADMIN_BASE, ADMIN_SETTINGS } from '../../config/security'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#0a0a0a'
const INK = '#0D1A14'

type Tab = 'brands' | 'creators' | 'team' | 'activity'

export default function AdminDashboard() {
  useDocumentHead({ title: 'Dashboard — JUST WHY US Admin', noIndex: true })
  const navigate = useNavigate()
  const { session, profile, isSuper } = useAdminAuth()

  const actor = useMemo(
    () =>
      profile
        ? { email: profile.email, name: profile.display_name }
        : session?.user?.email
          ? { email: session.user.email, name: session.user.email.split('@')[0] }
          : null,
    [profile, session],
  )

  const {
    brandRequests,
    creatorApps,
    admins,
    invites,
    activity,
    settings,
    loading,
    updateStatus,
    deleteRecord,
    createInvite,
    revokeInvite,
    regenerateInvite,
    removeAdmin,
    setAdminMfaRequired,
    setGlobalMfaRequired,
  } = useAdminData(actor)

  const [tab, setTab] = useState<Tab>('brands')

  const handleSignOut = async () => {
    await signOut()
    navigate(ADMIN_BASE)
  }

  const pendingBrands = brandRequests.filter((r) => r.status === 'pending').length
  const approvedCreators = creatorApps.filter((r) => r.status === 'approved').length

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: VOID }}>
      {/* Admin Navbar */}
      <nav
        style={{
          backgroundColor: INK,
          height: 56,
          borderBottom: `1px solid ${INK}`,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={24} />
          <span
            className="font-brand"
            style={{ fontSize: 14, color: TEAL, letterSpacing: '0.2em' }}
          >
            ADMIN
          </span>
        </div>

        {/* Center tabs */}
        <div style={{ display: 'flex', gap: 28 }}>
          {([
            { key: 'brands' as Tab, label: 'Brands' },
            { key: 'creators' as Tab, label: 'Creators' },
            { key: 'team' as Tab, label: 'Team' },
            { key: 'activity' as Tab, label: 'Activity' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: tab === t.key ? CREAM : 'rgba(240,235,216,0.4)',
                padding: '18px 0',
                borderBottom: tab === t.key ? `2px solid ${TEAL}` : '2px solid transparent',
                transition: 'all 200ms',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: CREAM,
              }}
            >
              {profile?.display_name ?? session?.user?.email}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: isSuper ? TEAL : 'rgba(240,235,216,0.4)',
              }}
            >
              {isSuper ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <button
            onClick={() => navigate(ADMIN_SETTINGS)}
            title="Settings"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              color: 'rgba(240,235,216,0.5)',
              padding: 4,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Settings
          </button>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              color: CORAL,
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = CORAL)}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Stat Cards */}
      <div
        style={{
          padding: '24px 32px',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <StatCard label="Total Requests" value={brandRequests.length} />
        <StatCard label="Pending" value={pendingBrands} />
        <StatCard label="Total Creators" value={creatorApps.length} />
        <StatCard label="Approved" value={approvedCreators} />
      </div>

      {/* Active Panel */}
      {tab === 'brands' && (
        <BrandRequestsTable
          data={brandRequests}
          loading={loading}
          onUpdateStatus={updateStatus}
          onDelete={deleteRecord}
        />
      )}
      {tab === 'creators' && (
        <CreatorApplicationsTable
          data={creatorApps}
          loading={loading}
          onUpdateStatus={updateStatus}
          onDelete={deleteRecord}
        />
      )}
      {tab === 'team' && (
        <TeamPanel
          admins={admins}
          invites={invites}
          settings={settings}
          currentEmail={actor?.email ?? ''}
          isSuper={isSuper}
          onCreateInvite={createInvite}
          onRevokeInvite={revokeInvite}
          onRegenerateInvite={regenerateInvite}
          onRemoveAdmin={removeAdmin}
          onSetAdminMfaRequired={setAdminMfaRequired}
          onSetGlobalMfaRequired={setGlobalMfaRequired}
        />
      )}
      {tab === 'activity' && (
        <ActivityPanel data={activity} loading={loading} />
      )}
    </div>
  )
}
