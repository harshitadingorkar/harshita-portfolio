'use client'

import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  hx: number; hy: number
  x: number;  y: number
  vx: number; vy: number
  r: number
  opacity: number
  phase: number
  driftAmp: number
  driftSpeed: number
  isAnchor: boolean
}

function seededRng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function parseHexRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '')
  if (h.length !== 6) return [28, 27, 25]
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const pRef      = useRef<Particle[]>([])
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const rgbRef    = useRef<[number, number, number]>([28, 27, 25])

  const syncColor = useCallback(() => {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue('--ink').trim()
    if (val) rgbRef.current = parseHexRgb(val)
  }, [])

  const build = useCallback((w: number, h: number) => {
    const rng = seededRng(8321)
    const particles: Particle[] = []

    // Anchor blobs — large, soft, very low opacity
    const centers = [
      [0.38, 0.44], [0.27, 0.52], [0.48, 0.37],
      [0.43, 0.58], [0.34, 0.41], [0.51, 0.50],
    ]
    for (const [ax, ay] of centers) {
      particles.push({
        hx: ax * w, hy: ay * h,
        x:  ax * w, y:  ay * h,
        vx: 0, vy: 0,
        r:  55 + rng() * 32,
        opacity: 0.04 + rng() * 0.04,
        phase: rng() * Math.PI * 2,
        driftAmp: 10 + rng() * 14,
        driftSpeed: 0.00018 + rng() * 0.00008,
        isAnchor: true,
      })
    }

    // Small particles
    for (let i = 0; i < 220; i++) {
      let hx: number, hy: number
      if (rng() < 0.68) {
        const [ax, ay] = centers[Math.floor(rng() * centers.length)]
        const angle  = rng() * Math.PI * 2
        const radius = rng() * 0.20 * Math.min(w, h)
        hx = ax * w + Math.cos(angle) * radius
        hy = ay * h + Math.sin(angle) * radius
      } else {
        hx = (0.08 + rng() * 0.76) * w
        hy = (0.08 + rng() * 0.76) * h
      }
      hx = Math.max(8, Math.min(w - 8, hx))
      hy = Math.max(8, Math.min(h - 8, hy))

      particles.push({
        hx, hy, x: hx, y: hy,
        vx: 0, vy: 0,
        r: 4 + rng() * 11,
        opacity: 0.07 + rng() * 0.22,
        phase: rng() * Math.PI * 2,
        driftAmp: 3 + rng() * 9,
        driftSpeed: 0.00025 + rng() * 0.0006,
        isAnchor: false,
      })
    }
    pRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = performance.now()
    const [r, g, b] = rgbRef.current
    const { x: mx, y: my } = mouseRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of pRef.current) {
      const driftX = Math.sin(now * p.driftSpeed + p.phase) * p.driftAmp
      const driftY = Math.cos(now * p.driftSpeed * 0.72 + p.phase + 1.57) * p.driftAmp

      if (!p.isAnchor) {
        const dx   = p.x - mx
        const dy   = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140 && dist > 0) {
          const f = ((140 - dist) / 140) * 0.65
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f
        }
      }

      p.vx += (p.hx + driftX - p.x) * 0.022
      p.vy += (p.hy + driftY - p.y) * 0.022
      p.vx *= 0.87
      p.vy *= 0.87
      p.x  += p.vx
      p.y  += p.vy

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
      grad.addColorStop(0,   `rgba(${r},${g},${b},${p.opacity})`)
      grad.addColorStop(0.45,`rgba(${r},${g},${b},${(p.opacity * 0.35).toFixed(3)})`)
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const par = canvas.parentElement
      if (par) { canvas.width = par.offsetWidth; canvas.height = par.offsetHeight }
      build(canvas.width, canvas.height)
    }

    resize()
    syncColor()

    const colorObs = new MutationObserver(syncColor)
    colorObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) * (canvas.width  / rect.width),
        y: (e.clientY - rect.top)  * (canvas.height / rect.height),
      }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      colorObs.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [animate, build, syncColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
