'use client'

import { useEffect, useRef } from 'react'

export default function LingerWave({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ t: 0, alpha: 0, targetAlpha: 0 })

  useEffect(() => {
    stateRef.current.targetAlpha = visible ? 1 : 0
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const setSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    setSize()
    window.addEventListener('resize', setSize)

    function draw() {
      if (!canvas || !ctx) return
      const s = stateRef.current
      // Smooth lerp toward target
      s.alpha += (s.targetAlpha - s.alpha) * 0.028

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight

      ctx.clearRect(0, 0, W, H)

      if (s.alpha < 0.003) {
        animId = requestAnimationFrame(draw)
        return
      }

      // Three overlapping waves for organic, fluid edge
      const layers = [
        { yBase: H * 0.12, amp1: 24, amp2: 12, amp3: 18, freq1: 2.8, freq2: 5, freq3: 1.4, speed: 1.0, alphaScale: 0.45 },
        { yBase: H * 0.22, amp1: 18, amp2: 9,  amp3: 14, freq1: 3.2, freq2: 4.5, freq3: 1.8, speed: 1.4, alphaScale: 0.65 },
        { yBase: H * 0.35, amp1: 14, amp2: 7,  amp3: 10, freq1: 2.5, freq2: 6,   freq3: 2.2, speed: 0.8, alphaScale: 1.0  },
      ]

      for (const layer of layers) {
        ctx.beginPath()
        ctx.moveTo(0, H)

        for (let x = 0; x <= W; x += 2) {
          const p = x / W
          const y =
            layer.yBase +
            Math.sin(p * Math.PI * layer.freq1 + s.t * layer.speed) * layer.amp1 +
            Math.sin(p * Math.PI * layer.freq2 + s.t * layer.speed * 1.3) * layer.amp2 +
            Math.sin(p * Math.PI * layer.freq3 + s.t * layer.speed * 0.6) * layer.amp3
          ctx.lineTo(x, y)
        }

        ctx.lineTo(W, H)
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, layer.yBase - 40, 0, H)
        grad.addColorStop(0, `rgba(26,25,24,0)`)
        grad.addColorStop(0.3, `rgba(26,25,24,${s.alpha * layer.alphaScale * 0.5})`)
        grad.addColorStop(1, `rgba(26,25,24,${s.alpha * layer.alphaScale})`)
        ctx.fillStyle = grad
        ctx.fill()
      }

      s.t += 0.011
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', setSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '55%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}
