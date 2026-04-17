import { motion } from 'framer-motion';

export default function GlitchTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
      className="relative"
    >
      <h1
        className="glitch-title font-display text-cream leading-none text-center"
        data-text="JUST WHY US"
        style={{
          fontSize: 'clamp(80px, 13vw, 160px)',
          letterSpacing: '0.08em',
        }}
      >
        JUST WHY US
      </h1>

      {/* Animated expanding bar */}
      <div className="mt-4 w-full max-w-[600px] mx-auto h-[2px] overflow-hidden">
        <div
          className="expand-bar h-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, #2BDBA4, #F0EBD8, #2BDBA4, transparent)',
          }}
        />
      </div>
    </motion.div>
  );
}
