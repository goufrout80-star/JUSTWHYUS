import { motion } from 'framer-motion'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const vp = { once: true, amount: 0.15 }

const steps = [
  {
    num: '01',
    stage: 'BRAND',
    stageColor: TEAL,
    title: 'Brand Enters',
    desc: 'A brand submits their request. We review fit before anything else happens.',
    bottom: 'Entry point',
  },
  {
    num: '02',
    stage: 'INTERNAL',
    stageColor: TEAL,
    title: 'Campaign Designed',
    desc: 'We design the full campaign internally. Strategy, format, creator profile \u2014 all of it.',
    bottom: 'Zero brand input needed',
  },
  {
    num: '03',
    stage: 'INTERNAL',
    stageColor: TEAL,
    title: 'Creators Selected',
    desc: 'We match creators from our private network based on niche, reliability, and audience fit.',
    bottom: 'Never random',
  },
  {
    num: '04',
    stage: 'CREATOR',
    stageColor: CORAL,
    title: 'Brief Dispatched',
    desc: 'Creators receive a detailed brief. No brand contact. No negotiation. Just the work.',
    bottom: 'Controlled delivery',
  },
  {
    num: '05',
    stage: 'CREATOR',
    stageColor: CORAL,
    title: 'Content Produced',
    desc: 'Creators produce and deliver content directly to us. We review before anything ships.',
    bottom: 'Quality gated',
  },
  {
    num: '06',
    stage: 'BRAND',
    stageColor: TEAL,
    title: 'Report Delivered',
    desc: 'Brand receives the campaign report. Performance, reach, and next steps. Done.',
    bottom: 'Full transparency',
  },
]

export default function CampaignFlowSection() {
  return (
    <section style={{ backgroundColor: INK, padding: '120px 0' }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 48 }}>
        <motion.p
          className="font-italic"
          style={{ fontSize: 13, color: 'rgba(43,219,164,0.55)', marginBottom: 16 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.6, ease }}
        >
          How it works
        </motion.p>
        <motion.h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(44px,7vw,88px)',
            letterSpacing: '-0.02em',
            color: CREAM,
            lineHeight: 1.05,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          HOW A CAMPAIGN RUNS.
        </motion.h2>
      </div>

      {/* Scroll hint */}
      <motion.p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(240,235,216,0.25)',
          textAlign: 'right',
          paddingRight: 'clamp(24px,6vw,120px)',
          marginBottom: 16,
        }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        SWIPE TO EXPLORE &rarr;
      </motion.p>

      {/* Horizontal scroll */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 'clamp(24px,6vw,120px)',
          paddingRight: 24,
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}
      >
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.08 * i, ease }}
            style={{
              minWidth: 300,
              height: 380,
              backgroundColor: VOID,
              border: `1px solid ${INK}`,
              borderRadius: 8,
              padding: '32px 28px',
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              cursor: 'default',
              transition: 'border-color 0.25s, transform 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(43,219,164,0.25)'
              e.currentTarget.style.transform = 'translateY(-6px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = INK
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Step number */}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 64,
                lineHeight: 1,
                color: 'rgba(43,219,164,0.08)',
              }}
            >
              {s.num}
            </span>

            {/* Stage tag */}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: s.stageColor,
                backgroundColor: `${s.stageColor}14`,
                border: `1px solid ${s.stageColor}33`,
                padding: '4px 10px',
                borderRadius: 3,
                width: 'fit-content',
                marginTop: 8,
              }}
            >
              {s.stage}
            </span>

            {/* Title */}
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: '-0.01em',
                color: CREAM,
                marginTop: 'auto',
              }}
            >
              {s.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: 'rgba(240,235,216,0.45)',
                lineHeight: 1.7,
                marginTop: 10,
              }}
            >
              {s.desc}
            </p>

            {/* Bottom line */}
            <div
              style={{
                borderTop: '1px solid rgba(43,219,164,0.15)',
                marginTop: 'auto',
                paddingTop: 20,
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 11,
                  color: 'rgba(240,235,216,0.25)',
                }}
              >
                {s.bottom}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
