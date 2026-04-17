import { motion } from 'framer-motion';
import ParticleCanvas from './components/ParticleCanvas';
import GlitchTitle from './components/GlitchTitle';
import CountdownTimer from './components/CountdownTimer';
import CornerOrnament from './components/CornerOrnament';
// NOTE: Replace this placeholder with your actual logo at src/assets/logo.svg
import logoSrc from './assets/logo.svg';

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
});

export default function App() {
  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-dark font-body">
      {/* LAYER 1 — Background dot grid */}
      <div className="fixed inset-0 z-0">
        <div
          className="dot-grid absolute"
          style={{
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Radial vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, #080808 70%)',
          }}
        />
      </div>

      {/* LAYER 2 — Particle canvas */}
      <ParticleCanvas />

      {/* LAYER 3 — Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 gap-6 sm:gap-8">
        {/* a) Top label */}
        <motion.p
          {...fadeUp(0.2)}
          className="font-body text-teal uppercase text-center"
          style={{ fontSize: '10px', letterSpacing: '0.5em' }}
        >
          SOMETHING EXTRAORDINARY IS COMING
        </motion.p>

        {/* b) Logo */}
        <motion.img
          src={logoSrc}
          alt="JUST WHY US"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-20 h-20 object-contain rounded-xl"
          style={{
            boxShadow: '0 0 24px rgba(43, 219, 164, 0.35)',
          }}
        />

        {/* c) Main title with glitch */}
        <GlitchTitle />

        {/* d) Tagline */}
        <motion.p
          {...fadeUp(1)}
          className="font-body uppercase text-center"
          style={{
            fontSize: '12px',
            letterSpacing: '0.4em',
            color: 'rgba(240, 235, 216, 0.5)',
          }}
        >
          One operator. Curated creators. Controlled execution.
        </motion.p>

        {/* e) Ornament divider */}
        <motion.div
          {...fadeUp(1.1)}
          className="flex items-center gap-3 w-full max-w-[480px]"
        >
          <div className="flex-1 h-px bg-teal/30" />
          <div className="w-[6px] h-[6px] bg-teal pulse-diamond" />
          <div className="flex-1 h-px bg-teal/30" />
        </motion.div>

        {/* f) Countdown timer */}
        <CountdownTimer />

        {/* g) Bottom line */}
        <motion.p
          {...fadeUp(1.8)}
          className="font-body uppercase text-center"
          style={{
            fontSize: '10px',
            letterSpacing: '0.4em',
            color: 'rgba(240, 235, 216, 0.2)',
          }}
        >
          Launching April 12, 2026 &nbsp;&middot;&nbsp; justwhy.us
        </motion.p>
      </div>

      {/* h) Corner ornaments */}
      <CornerOrnament corner="top-left" />
      <CornerOrnament corner="top-right" />
      <CornerOrnament corner="bottom-right" />
      <CornerOrnament corner="bottom-left" />
    </div>
  );
}
