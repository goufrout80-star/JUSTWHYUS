import { useRef } from 'react';
import useParticles from '../hooks/useParticles';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ width: '100vw', height: '100dvh' }}
    />
  );
}
