import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/home/Navbar'
import { useDocumentHead } from '../hooks/useDocumentHead'

const ease = [0.22, 1, 0.36, 1] as const

const brandBullets = [
  'Full campaign execution — you never touch a creator',
  'Vetted network across AI, SaaS, filmmaking & more',
  'One brief in. One report out. That simple.',
]

const creatorBullets = [
  'Get matched to real campaigns — no cold pitching',
  'Work directly with JWU — never the brand',
  'Get paid on time. Every time.',
]

type Side = 'none' | 'brands' | 'creators'

export default function Select() {
  useDocumentHead({
    title: 'Choose Your Path — JUST WHY US',
    description: 'Are you a brand looking to run creator campaigns, or a creator looking to join our vetted network? Pick your path.',
    canonical: 'https://justwhyus.com/select',
  })
  const navigate = useNavigate()
  const [hover, setHover] = useState<Side>('none')
  const [clicked, setClicked] = useState<Side>('none')
  const [isMobile] = useState(() => window.innerWidth < 768)

  const handleClick = useCallback(
    (side: 'brands' | 'creators') => {
      setClicked(side)
      setTimeout(() => {
        navigate(side === 'brands' ? '/brands' : '/creators')
      }, 700)
    },
    [navigate],
  )

  const brandsWidth =
    clicked === 'brands'
      ? '100%'
      : clicked === 'creators'
        ? '0%'
        : hover === 'brands'
          ? '65%'
          : hover === 'creators'
            ? '35%'
            : '50%'

  const creatorsWidth =
    clicked === 'creators'
      ? '100%'
      : clicked === 'brands'
        ? '0%'
        : hover === 'creators'
          ? '65%'
          : hover === 'brands'
            ? '35%'
            : '50%'

  const brandsOpacity =
    hover === 'creators' ? 0.5 : hover === 'brands' ? 1 : 0.8
  const creatorsOpacity =
    hover === 'brands' ? 0.5 : hover === 'creators' ? 1 : 0.8

  /* ─── Mobile ─── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#0a0a0a' }}>
        <Navbar />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            paddingTop: 64,
          }}
        >
          <MobileSide
            label="BRANDS"
            accent="#2BDBA4"
            bullets={brandBullets}
            cta="Request Access"
            onClick={() => navigate('/brands')}
            delay={0}
          />
          <div
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(240,235,216,0.08), transparent)',
              position: 'relative',
            }}
          >
            <span
              className="font-italic"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 10,
                color: 'rgba(240,235,216,0.12)',
                whiteSpace: 'nowrap',
                backgroundColor: '#0a0a0a',
                padding: '0 12px',
              }}
            >
              who are you?
            </span>
          </div>
          <MobileSide
            label="CREATORS"
            accent="#FF5C38"
            bullets={creatorBullets}
            cta="Apply to Network"
            onClick={() => navigate('/creators')}
            delay={0.15}
          />
        </div>
      </div>
    )
  }

  /* ─── Desktop ─── */
  return (
    <div
      style={{
        height: '100dvh',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Navbar />

      <div
        style={{
          display: 'flex',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* ── Brands Side ── */}
        <motion.div
          style={{
            height: '100%',
            overflow: 'hidden',
            cursor: clicked !== 'none' ? 'default' : 'pointer',
            position: 'relative',
          }}
          animate={{
            width: brandsWidth,
            opacity: clicked === 'creators' ? 0 : brandsOpacity,
          }}
          transition={{ duration: 0.6, ease }}
          onMouseEnter={() => clicked === 'none' && setHover('brands')}
          onMouseLeave={() => clicked === 'none' && setHover('none')}
          onClick={() => clicked === 'none' && handleClick('brands')}
        >
          <SideContent
            label="BRANDS"
            accent="#2BDBA4"
            bullets={brandBullets}
            cta="Request Access"
            align="left"
            isActive={hover === 'brands'}
            isClicked={clicked === 'brands'}
            mode="light"
          />
        </motion.div>

        {/* ── Center Divider ── */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
          animate={{
            left:
              clicked === 'brands'
                ? '100%'
                : clicked === 'creators'
                  ? '0%'
                  : hover === 'brands'
                    ? '65%'
                    : hover === 'creators'
                      ? '35%'
                      : '50%',
            opacity: clicked !== 'none' ? 0 : 1,
          }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Vertical line */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 1,
              background:
                'linear-gradient(180deg, transparent 5%, rgba(240,235,216,0.08) 30%, rgba(240,235,216,0.08) 70%, transparent 95%)',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, delay: 0.3, ease }}
          />

          {/* Rotated text */}
          <motion.span
            className="font-italic"
            style={{
              position: 'absolute',
              fontSize: 11,
              color: 'rgba(240,235,216,0.1)',
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.3em',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
          >
            who are you?
          </motion.span>

          {/* Center dot */}
          <motion.div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'rgba(240,235,216,0.08)',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease }}
          />
        </motion.div>

        {/* ── Creators Side ── */}
        <motion.div
          style={{
            height: '100%',
            overflow: 'hidden',
            cursor: clicked !== 'none' ? 'default' : 'pointer',
            position: 'relative',
          }}
          animate={{
            width: creatorsWidth,
            opacity: clicked === 'brands' ? 0 : creatorsOpacity,
          }}
          transition={{ duration: 0.6, ease }}
          onMouseEnter={() => clicked === 'none' && setHover('creators')}
          onMouseLeave={() => clicked === 'none' && setHover('none')}
          onClick={() => clicked === 'none' && handleClick('creators')}
        >
          <SideContent
            label="CREATORS"
            accent="#FF5C38"
            bullets={creatorBullets}
            cta="Apply to Network"
            align="right"
            isActive={hover === 'creators'}
            isClicked={clicked === 'creators'}
            mode="dark"
          />
        </motion.div>
      </div>
    </div>
  )
}

/* ━━━ Side Content (Desktop) ━━━ */
function SideContent({
  label,
  accent,
  bullets,
  cta,
  align,
  isActive,
  isClicked,
  mode,
}: {
  label: string
  accent: string
  bullets: string[]
  cta: string
  align: 'left' | 'right'
  isActive: boolean
  isClicked: boolean
  mode: 'light' | 'dark'
}) {
  const paddingSide = align === 'left' ? 'paddingLeft' : 'paddingRight'
  const textAlign = align as 'left' | 'right'
  const isLight = mode === 'light'
  const [btnHover, setBtnHover] = useState(false)

  const bg = isLight ? '#F0EBD8' : '#0a0a0a'
  const titleColor = isLight ? '#0a0a0a' : '#F0EBD8'
  const bulletColor = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(240,235,216,0.45)'
  const ghostNumOpacity = isLight ? 0.05 : 0.03

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        [paddingSide]: 'clamp(48px, 8vw, 120px)',
        padding: '0 clamp(48px, 6vw, 100px)',
        position: 'relative',
        backgroundColor: bg,
        transition: 'background-color 400ms',
      }}
    >
      {/* Accent glow on active */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          [align]: 0,
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}08, transparent 70%)`,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
        animate={{ opacity: isActive || isClicked ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Number */}
      <motion.span
        className="font-brand"
        style={{
          fontSize: 'clamp(120px, 20vw, 240px)',
          color: accent,
          opacity: ghostNumOpacity,
          position: 'absolute',
          top: '50%',
          [align]: 'clamp(20px, 4vw, 60px)',
          transform: 'translateY(-50%)',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: ghostNumOpacity }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {label === 'BRANDS' ? '01' : '02'}
      </motion.span>

      <div style={{ position: 'relative', textAlign }}>
        {/* Label */}
        <motion.p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: accent,
            opacity: 0.5,
            marginBottom: 12,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
        >
          {label === 'BRANDS' ? 'I AM A BRAND' : 'I AM A CREATOR'}
        </motion.p>

        {/* Title */}
        <motion.h1
          className="font-brand"
          style={{
            fontSize: 'clamp(48px, 6vw, 80px)',
            color: titleColor,
            lineHeight: 1.05,
            marginBottom: 32,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease }}
        >
          {label}
        </motion.h1>

        {/* Bullets */}
        {bullets.map((b, i) => (
          <motion.div
            key={b}
            style={{
              display: 'flex',
              alignItems: textAlign === 'right' ? 'flex-end' : 'flex-start',
              flexDirection: textAlign === 'right' ? 'row-reverse' : 'row',
              gap: 12,
              marginBottom: 14,
            }}
            initial={{ opacity: 0, x: align === 'left' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + 0.08 * i, ease }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: accent,
                opacity: 0.4,
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: bulletColor,
                lineHeight: 1.5,
              }}
            >
              {b}
            </span>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.button
          className="font-brand"
          style={{
            marginTop: 28,
            fontSize: 13,
            letterSpacing: '0.15em',
            color: isLight
              ? bg
              : btnHover ? '#080808' : accent,
            background: isLight
              ? btnHover ? `${accent}dd` : accent
              : btnHover ? accent : `${accent}12`,
            padding: '14px 36px',
            borderRadius: 999,
            border: `1.5px solid ${accent}`,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            outline: 'none',
            boxShadow: btnHover
              ? `0 0 32px ${accent}55, 0 8px 32px ${accent}30`
              : '0 0 0 transparent',
            transition: 'background 0.25s, color 0.2s, box-shadow 0.35s',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setBtnHover(true)}
          onHoverEnd={() => setBtnHover(false)}
        >
          {cta}
          <motion.span
            animate={{ x: btnHover ? 7 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-block', fontSize: 15 }}
          >
            →
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}

/* ━━━ Mobile Side ━━━ */
function MobileSide({
  label,
  accent,
  bullets,
  cta,
  onClick,
  delay,
}: {
  label: string
  accent: string
  bullets: string[]
  cta: string
  onClick: () => void
  delay: number
}) {
  const [btnHover, setBtnHover] = useState(false)
  return (
    <motion.div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 32px',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: accent,
          opacity: 0.5,
          marginBottom: 10,
        }}
      >
        {label === 'BRANDS' ? 'I AM A BRAND' : 'I AM A CREATOR'}
      </p>

      <h2
        className="font-brand"
        style={{
          fontSize: 'clamp(36px, 8vw, 56px)',
          color: '#F0EBD8',
          lineHeight: 1.1,
          marginBottom: 24,
        }}
      >
        {label}
      </h2>

      {bullets.map((b) => (
        <div
          key={b}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: accent,
              opacity: 0.4,
              marginTop: 6,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              color: 'rgba(240,235,216,0.45)',
              lineHeight: 1.5,
            }}
          >
            {b}
          </span>
        </div>
      ))}

      <motion.button
        className="font-brand"
        style={{
          marginTop: 20,
          fontSize: 13,
          letterSpacing: '0.15em',
          color: btnHover ? '#080808' : accent,
          background: btnHover ? accent : 'transparent',
          padding: '14px 32px',
          borderRadius: 999,
          border: `1.5px solid ${accent}`,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          outline: 'none',
          boxShadow: btnHover
            ? `0 0 28px ${accent}55, 0 8px 24px ${accent}25`
            : '0 0 0 transparent',
          transition: 'background 0.25s, color 0.2s, box-shadow 0.35s',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setBtnHover(true)}
        onHoverEnd={() => setBtnHover(false)}
      >
        {cta}
        <motion.span
          animate={{ x: btnHover ? 7 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{ display: 'inline-block', fontSize: 15 }}
        >
          →
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
