import { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface Meteor {
  x: number
  y: number
  length: number
  speed: number
  alpha: number
  active: boolean
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)
    let animId: number
    const mouse = { x: -9999, y: -9999 }

    const particles: Particle[] = Array.from({ length: 120 }, () => {
      const isTeal = Math.random() > 0.7
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: 0.4 + Math.random() * 1.2,
        color: isTeal ? 'rgba(43,219,164,' : 'rgba(240,235,216,',
        alpha: isTeal ? 0.18 : 0.15,
        twinkleSpeed: 3 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
      }
    })

    const meteor: Meteor = {
      x: 0,
      y: 0,
      length: 0,
      speed: 7,
      alpha: 0,
      active: false,
    }

    let meteorTimer = 12000 + Math.random() * 8000
    let lastMeteor = performance.now()

    const handleResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouse)

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H)

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const twinkle =
          Math.sin(now / 1000 / p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5
        const a = p.alpha * (0.4 + twinkle * 0.6)

        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          p.vx += (dx / dist) * 0.006
          p.vy += (dy / dist) * 0.006
        }

        p.x += p.vx
        p.y += p.vy

        // Wrap
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        // Damping
        p.vx *= 0.999
        p.vy *= 0.999

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + a + ')'
        ctx.fill()

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const cdx = p.x - p2.x
          const cdy = p.y - p2.y
          const cd = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cd < 85) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(43,219,164,${0.04 * (1 - cd / 85)})`
            ctx.stroke()
          }
        }
      }

      // Meteor
      if (!meteor.active && now - lastMeteor > meteorTimer) {
        meteor.active = true
        meteor.x = Math.random() * W
        meteor.y = -20
        meteor.length = 90 + Math.random() * 40
        meteor.alpha = 0.2
        meteorTimer = 12000 + Math.random() * 8000
        lastMeteor = now
      }

      if (meteor.active) {
        const mx = meteor.x + meteor.speed * 0.707
        const my = meteor.y + meteor.speed * 0.707
        const grad = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - meteor.length * 0.707,
          meteor.y - meteor.length * 0.707
        )
        grad.addColorStop(0, `rgba(240,235,216,${meteor.alpha})`)
        grad.addColorStop(1, 'rgba(240,235,216,0)')
        ctx.beginPath()
        ctx.moveTo(meteor.x, meteor.y)
        ctx.lineTo(
          meteor.x - meteor.length * 0.707,
          meteor.y - meteor.length * 0.707
        )
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.lineWidth = 1

        meteor.x = mx
        meteor.y = my

        if (meteor.y > H + 100) {
          meteor.active = false
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}
