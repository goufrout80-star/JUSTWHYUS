import { useNavigate } from 'react-router-dom'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { useSmartBack } from '../hooks/useSmartBack'
import LogoMark from '../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'

export default function NotFound() {
  useDocumentHead({
    title: '404 — Page Not Found · JUST WHY US',
    noIndex: true,
  })
  const navigate = useNavigate()
  const goBack = useSmartBack()

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: VOID,
        color: CREAM,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ marginBottom: 28, opacity: 0.9 }}>
        <LogoMark size={44} />
      </div>

      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(96px, 18vw, 180px)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: CREAM,
          opacity: 0.95,
        }}
      >
        404
      </div>

      <div
        style={{
          marginTop: 8,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: TEAL,
        }}
      >
        Not Found
      </div>

      <p
        style={{
          marginTop: 16,
          maxWidth: 460,
          fontSize: 15,
          lineHeight: 1.6,
          color: 'rgba(240,235,216,0.6)',
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div
        style={{
          marginTop: 36,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={goBack}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: VOID,
            backgroundColor: TEAL,
            border: 'none',
            borderRadius: 4,
            padding: '14px 26px',
            cursor: 'pointer',
          }}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: CREAM,
            backgroundColor: 'transparent',
            border: `1px solid ${CREAM}30`,
            borderRadius: 4,
            padding: '14px 26px',
            cursor: 'pointer',
          }}
        >
          Home
        </button>
      </div>
    </main>
  )
}
