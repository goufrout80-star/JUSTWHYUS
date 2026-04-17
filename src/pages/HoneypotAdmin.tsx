import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { logSecurityEvent } from '../lib/security'
import { useDocumentHead } from '../hooks/useDocumentHead'

/**
 * Honeypot decoy page for common admin URLs.
 * Displays a realistic-looking 404 while silently logging the attacker.
 * The delay also slows down bruteforce scanners.
 */
export default function HoneypotAdmin() {
  useDocumentHead({
    title: '404 — Page Not Found',
    noIndex: true,
  })
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Log the attempt (fire-and-forget)
    logSecurityEvent({
      event: 'honeypot_hit',
      path: pathname,
      meta: { url: window.location.href },
    })

    // Artificial delay to slow scanners
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [pathname])

  if (!visible) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#fff',
        }}
      />
    )
  }

  // Deliberately styled like a generic nginx/apache 404 to look boring
  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Times, serif',
        padding: '40px 60px',
        background: '#fff',
        color: '#000',
        minHeight: '100dvh',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>404 Not Found</h1>
      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ccc' }} />
      <p style={{ fontSize: 14 }}>
        The requested URL was not found on this server.
      </p>
      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ccc' }} />
      <address style={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>
        nginx
      </address>
    </div>
  )
}
