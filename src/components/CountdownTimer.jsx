import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import useCountdown from '../hooks/useCountdown';

const TARGET = new Date('2026-04-12T00:00:00').getTime();

const LABELS = ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'];
const KEYS = ['days', 'hours', 'minutes', 'seconds'];

function CountdownUnit({ value, label }) {
  const prevRef = useRef(value);
  const elRef = useRef(null);

  useEffect(() => {
    if (prevRef.current !== value && elRef.current) {
      elRef.current.classList.remove('flash-teal');
      void elRef.current.offsetWidth;
      elRef.current.classList.add('flash-teal');
    }
    prevRef.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
      <span
        ref={elRef}
        className="font-display text-cream leading-none"
        style={{ fontSize: 'clamp(56px, 9vw, 96px)' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span
        className="font-body text-teal uppercase mt-2"
        style={{ fontSize: '9px', letterSpacing: '0.45em' }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const timeLeft = useCountdown(TARGET);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
      className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap"
    >
      {KEYS.map((key, i) => (
        <div key={key} className="flex items-center gap-2 sm:gap-4">
          <CountdownUnit value={timeLeft[key]} label={LABELS[i]} />
          {i < KEYS.length - 1 && (
            <span
              className="blink-colon font-display text-teal"
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                opacity: 0.4,
                lineHeight: 1,
              }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
