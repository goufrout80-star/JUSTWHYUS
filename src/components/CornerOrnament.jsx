import { motion } from 'framer-motion';
import clsx from 'clsx';

const positions = {
  'top-left': { top: 16, left: 16, rotate: 0 },
  'top-right': { top: 16, right: 16, rotate: 90 },
  'bottom-right': { bottom: 16, right: 16, rotate: 180 },
  'bottom-left': { bottom: 16, left: 16, rotate: 270 },
};

export default function CornerOrnament({ corner }) {
  const pos = positions[corner];
  const style = { ...pos, position: 'fixed' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 1, delay: 2 }}
      className="z-20 pointer-events-none"
      style={style}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${pos.rotate}deg)` }}
      >
        <path
          d="M1 24 L1 1 L24 1"
          stroke="#2BDBA4"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="1" cy="1" r="2" fill="#2BDBA4" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </motion.div>
  );
}
