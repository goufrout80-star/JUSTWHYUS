import { motion } from 'framer-motion'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const vp = { once: true, amount: 0.15 }

const pills = ['9-STEP PROCESS', '100% CONTROLLED', 'ZERO BRAND\u2013CREATOR CONTACT', 'BUILT FOR SCALE']

const pipeline = [
  { name: 'AI Tool Launch', tag: 'AI', w: 85, status: 'Delivering', live: true },
  { name: 'SaaS Rollout', tag: 'SAAS', w: 62, status: 'Briefing', live: false },
  { name: 'Gear Drop', tag: 'GEAR', w: 40, status: 'Selecting', live: false },
  { name: 'Prod Campaign', tag: 'PROD', w: 91, status: 'Reporting', live: true },
  { name: 'New Entry', tag: 'NEW', w: 18, status: 'Entering', live: false },
]

const activity = [
  { dot: TEAL, text: 'Brief sent \u2014 6 creators \u2192 AI Tool', time: '2m' },
  { dot: TEAL, text: 'Brand approved \u2014 SaaS launch', time: '14m' },
  { dot: CORAL, text: 'Content delivered \u2014 Gear drop', time: '1h' },
  { dot: TEAL, text: 'Creator matched \u2014 Productivity', time: '3h' },
]

export default function WorkflowSection() {
  return (
    <section style={{ backgroundColor: VOID, padding: '120px 0' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: 64,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT — Text */}
        <div style={{ flex: '1 1 340px' }}>
          <motion.p
            className="font-italic"
            style={{ fontSize: 13, color: 'rgba(43,219,164,0.55)', marginBottom: 16 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={vp}
            transition={{ duration: 0.6, ease }}
          >
            Inside the system
          </motion.p>

          {[
            { text: 'THIS IS WHAT', color: CREAM },
            { text: 'EXECUTION', color: TEAL },
            { text: 'LOOKS LIKE.', color: CREAM },
          ].map((line, i) => (
            <motion.div
              key={line.text}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(40px,5.5vw,64px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: line.color,
              }}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={vp}
              transition={{ duration: 0.6, delay: 0.08 * i, ease }}
            >
              {line.text}
            </motion.div>
          ))}

          <motion.p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 15,
              color: 'rgba(240,235,216,0.45)',
              lineHeight: 1.8,
              maxWidth: 360,
              marginTop: 20,
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.6, delay: 0.3, ease }}
          >
            Every campaign runs through a controlled internal system. Brands see the report. Nobody sees what happens in between.
          </motion.p>

          <motion.div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={vp}
            transition={{ duration: 0.6, delay: 0.4, ease }}
          >
            {pills.map((p) => (
              <span
                key={p}
                style={{
                  backgroundColor: 'rgba(43,219,164,0.06)',
                  border: '1px solid rgba(43,219,164,0.15)',
                  borderRadius: 999,
                  padding: '7px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: TEAL,
                }}
              >
                {p}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Dashboard mockup */}
        <motion.div
          style={{ flex: '1 1 500px' }}
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={vp}
          transition={{ duration: 0.8, ease }}
        >
          <div
            style={{
              background: '#090909',
              border: '1px solid rgba(43,219,164,0.1)',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                height: 36,
                backgroundColor: INK,
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CORAL }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F5C842' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TEAL }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 10, color: 'rgba(240,235,216,0.2)', marginLeft: 10, flex: 1 }}>app.justwhyus.com/campaigns</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: TEAL, animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(43,219,164,0.6)', marginLeft: 4 }}>LIVE</span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: 8, padding: 12 }}>
              {[
                { label: 'ACTIVE CAMPAIGNS', val: '12', c: TEAL },
                { label: 'CREATORS BRIEFED', val: '47', c: CREAM },
                { label: 'BRANDS IN SYSTEM', val: '9', c: CORAL },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(43,219,164,0.03)',
                    border: '1px solid rgba(43,219,164,0.07)',
                    borderRadius: 6,
                    padding: '10px 14px',
                  }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(240,235,216,0.25)' }}>{m.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, color: m.c, marginTop: 2 }}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Pipeline */}
            <div style={{ padding: '0 12px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.35em', color: 'rgba(240,235,216,0.22)', marginBottom: 8 }}>CAMPAIGN PIPELINE</p>
              {pipeline.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(43,219,164,0.04)' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, color: 'rgba(240,235,216,0.65)', minWidth: 95 }}>{p.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: TEAL, backgroundColor: 'rgba(43,219,164,0.06)', padding: '2px 6px', borderRadius: 3 }}>{p.tag}</span>
                  <div style={{ flex: 1, height: 3, backgroundColor: 'rgba(43,219,164,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', backgroundColor: TEAL, borderRadius: 999 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.w}%` }}
                      viewport={vp}
                      transition={{ duration: 1.2, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: p.live ? TEAL : 'rgba(240,235,216,0.35)', minWidth: 55, textAlign: 'right' }}>{p.status}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: p.live ? TEAL : 'rgba(240,235,216,0.15)', ...(p.live ? { animation: 'pulse-dot 2s ease-in-out infinite' } : {}) }} />
                </div>
              ))}
            </div>

            {/* Activity */}
            <div style={{ padding: '8px 12px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(240,235,216,0.18)', marginBottom: 6 }}>RECENT ACTIVITY</p>
              {activity.map((a) => (
                <div key={a.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(43,219,164,0.03)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: a.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 10, color: 'rgba(240,235,216,0.3)', flex: 1 }}>{a.text}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(240,235,216,0.16)' }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Ticker */}
            <div style={{ height: 26, backgroundColor: 'rgba(43,219,164,0.03)', borderTop: '1px solid rgba(43,219,164,0.07)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              <motion.div
                animate={{ x: [0, -600] }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(43,219,164,0.35)', whiteSpace: 'nowrap', paddingLeft: 12 }}
              >
                CAMPAIGN ACTIVE — AI TOOLS &bull; BRIEF DISPATCHED — SAAS &bull; REPORT DELIVERED — GEAR &bull; SYSTEM OPERATIONAL &bull; CAMPAIGN ACTIVE — AI TOOLS &bull; BRIEF DISPATCHED — SAAS &bull;
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
