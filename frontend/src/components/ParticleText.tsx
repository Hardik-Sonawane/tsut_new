import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  homeX: number; homeY: number
  vx: number; vy: number
  size: number; color: string; friction: number
}

const COLORS = ['#4F46E5','#6366F1','#7C3AED','#8B5CF6','#0D9488','#14B8A6','#2DD4BF','#F59E0B']

export default function ParticleText() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // From here, canvas and ctx are guaranteed non-null.
    // We capture them in local consts so TypeScript trusts them inside nested functions.
    const c: HTMLCanvasElement = canvas
    const g: CanvasRenderingContext2D = ctx

    let particles: Particle[] = []
    let animId: number
    let W = 0, H = 0

    function resize() {
      W = c.offsetWidth
      H = c.offsetHeight
      c.width = W * window.devicePixelRatio
      c.height = H * window.devicePixelRatio
      g.scale(window.devicePixelRatio, window.devicePixelRatio)
      buildParticles()
    }

    function buildParticles() {
      particles = []
      const offscreen = document.createElement('canvas')
      offscreen.width = W
      offscreen.height = H
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return

      const fontSize = Math.min(W / 9, 72)
      offCtx.clearRect(0, 0, W, H)
      offCtx.fillStyle = '#ffffff'
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'
      offCtx.font = `900 ${fontSize}px 'Inter', 'Outfit', sans-serif`

      const lineH = fontSize * 1.35
      const yMid = H / 2
      offCtx.fillText('Text Summarization', W / 2, yMid - lineH / 2)
      offCtx.fillText('Using Transformers', W / 2, yMid + lineH / 2)

      const imgData = offCtx.getImageData(0, 0, W, H).data
      const gap = Math.max(3, Math.floor(W / 200))

      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          const i = (y * W + x) * 4
          if (imgData[i + 3] > 120) {
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              homeX: x, homeY: y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: 1.2 + Math.random() * 1.8,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              friction: 0.86 + Math.random() * 0.08,
            })
          }
        }
      }
    }

    function explode(ex: number, ey: number, strength: number) {
      const radius = 160
      particles.forEach(p => {
        const dx = p.x - ex, dy = p.y - ey
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < radius) {
          const f = (radius - dist) / radius
          const angle = Math.atan2(dy, dx)
          p.vx += Math.cos(angle) * f * strength
          p.vy += Math.sin(angle) * f * strength
        }
      })
    }

    function onMouseMove(e: MouseEvent) {
      const r = c.getBoundingClientRect()
      explode(e.clientX - r.left, e.clientY - r.top, 5)
    }
    function onClick(e: MouseEvent) {
      const r = c.getBoundingClientRect()
      explode(e.clientX - r.left, e.clientY - r.top, 28)
    }
    function onTouch(e: TouchEvent) {
      const r = c.getBoundingClientRect()
      explode(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top, 28)
    }

    c.addEventListener('mousemove', onMouseMove)
    c.addEventListener('click', onClick)
    c.addEventListener('touchstart', onTouch)

    const spring = 0.055

    function animate() {
      g.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.vx += (p.homeX - p.x) * spring
        p.vy += (p.homeY - p.y) * spring
        p.vx *= p.friction
        p.vy *= p.friction
        p.x += p.vx
        p.y += p.vy

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        g.save()
        if (speed > 1) {
          g.shadowColor = p.color
          g.shadowBlur = Math.min(speed * 1.5, 8)
        }
        g.beginPath()
        g.arc(p.x, p.y, p.size + speed * 0.15, 0, Math.PI * 2)
        g.fillStyle = p.color
        g.globalAlpha = Math.min(0.85 + speed * 0.03, 1)
        g.fill()
        g.restore()
      })
      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(c)

    return () => {
      cancelAnimationFrame(animId)
      c.removeEventListener('mousemove', onMouseMove)
      c.removeEventListener('click', onClick)
      c.removeEventListener('touchstart', onTouch)
      ro.disconnect()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'clamp(160px, 22vw, 240px)', display: 'block', cursor: 'crosshair' }}
      />
      <p style={{
        textAlign: 'center', fontSize: 11, color: 'var(--text-faint)',
        letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
        marginTop: 6, marginBottom: 0, animation: 'fadeInHint 2s ease 1.5s both',
      }}>
        ✦ click or hover to interact
      </p>
      <style>{`@keyframes fadeInHint { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}
