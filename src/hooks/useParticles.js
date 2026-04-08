import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 150;
const CONNECT_DIST = 100;
const MOUSE_RADIUS = 200;
const TEAL = { r: 43, g: 219, b: 164 };
const CREAM = { r: 240, g: 235, b: 216 };

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createParticle(w, h) {
  const isTeal = Math.random() > 0.4;
  const color = isTeal ? TEAL : CREAM;
  const alpha = isTeal ? 0.2 : 0.1;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: randomBetween(-0.3, 0.3),
    vy: randomBetween(-0.3, 0.3),
    r: randomBetween(1, 2.5),
    color,
    alpha,
  };
}

function createMeteor(w, h) {
  return {
    x: Math.random() * w,
    y: -20,
    vx: randomBetween(1.5, 3),
    vy: randomBetween(2, 4),
    length: randomBetween(40, 80),
    life: 1,
    decay: randomBetween(0.003, 0.008),
  };
}

export default function useParticles(canvasRef) {
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let particles = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(w, h)
    );
    let meteors = [];
    let lastMeteor = Date.now();

    function handleResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    function handleMouseLeave() {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      if (now - lastMeteor > randomBetween(2000, 5000)) {
        meteors.push(createMeteor(w, h));
        lastMeteor = now;
      }

      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * (m.length / 3), m.y - m.vy * (m.length / 3));
        ctx.strokeStyle = `rgba(43, 219, 164, ${m.life * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        p.vx *= 0.999;
        p.vy *= 0.999;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(43, 219, 164, ${
              0.08 * (1 - d / CONNECT_DIST)
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef]);
}
