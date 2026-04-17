import { motion } from 'framer-motion'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const vp = { once: true, amount: 0.15 }

const oldWay = [
  'Agency finds creators',
  'Brand manages every creator',
  'Back and forth chaos',
  'You pray it deploys',
]

const jwuWay = [
  'Campaign designed internally',
  'One brief. One contact point.',
  'Creators never see the brand',
  'You get the report. Done.',
]

export default function ProblemSection() {
  return (
    <section style={{ backgroundColor: INK, padding: '120px 0' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: 80,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT */}
        <div style={{ flex: '1 1 480px' }}>
          <motion.p
            className="font-italic"
            style={{ fontSize: 13, color: 'rgba(43,219,164,0.55)', marginBottom: 16 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={vp}
            transition={{ duration: 0.6, ease }}
          >
            The problem
          </motion.p>

          {[
            { text: 'Most agencies', color: CREAM },
            { text: 'connect you.', color: CREAM },
            { text: 'We execute', color: CREAM },
            { text: 'for you.', color: TEAL },
          ].map((line, i) => (
            <motion.div
              key={line.text}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: line.color,
              }}
              initial={{ opacity: 0, x: -32 }}
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
              color: 'rgba(240,235,216,0.48)',
              lineHeight: 1.85,
              maxWidth: 400,
              marginTop: 24,
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.6, delay: 0.35, ease }}
          >
            Every other agency hands you a list of creators and wishes you luck. We design your campaign. We brief the creators. We deliver. You get the report. Brands never touch creators.
          </motion.p>
        </div>

        {/* RIGHT — Comparison */}
        <div style={{ flex: '1 1 380px', display: 'flex', gap: 16 }}>
          {/* Old way */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255,92,56,0.7)',
                paddingBottom: 10,
                marginBottom: 16,
                borderBottom: '1px solid rgba(255,92,56,0.2)',
              }}
            >
              THE OLD WAY
            </p>
            {oldWay.map((item, i) => (
              <motion.p
                key={item}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'rgba(240,235,216,0.38)',
                  paddingLeft: 16,
                  borderLeft: '1px solid rgba(255,92,56,0.2)',
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={vp}
                transition={{ duration: 0.5, delay: 0.1 * i, ease }}
              >
                {item}
              </motion.p>
            ))}
          </div>

          {/* JWU way */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(43,219,164,0.7)',
                paddingBottom: 10,
                marginBottom: 16,
                borderBottom: '1px solid rgba(43,219,164,0.2)',
              }}
            >
              THE JWU WAY
            </p>
            {jwuWay.map((item, i) => (
              <motion.p
                key={item}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'rgba(240,235,216,0.75)',
                  paddingLeft: 16,
                  borderLeft: '1px solid rgba(43,219,164,0.3)',
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={vp}
                transition={{ duration: 0.5, delay: 0.1 * i + 0.2, ease }}
              >
                {item}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
