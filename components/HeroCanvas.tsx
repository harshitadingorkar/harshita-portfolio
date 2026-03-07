'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PatronData, SHAPES,
  getOrCreatePatron, hasVisitedBefore, markVisited,
  setLastVisit, mulberry32, hashString,
} from '@/lib/patronus'

// ── Seeded RNG (existing) ────────────────────────────────────────────────────
function mulberry32Local(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Existing types ───────────────────────────────────────────────────────────
interface Dot {
  hx: number; hy: number; x: number; y: number
  vx: number; vy: number; size: number; phase: number
  driftAmp: number; driftSpeed: number
  grainOffsets: Array<{ dx: number; dy: number; opacity: number }>
  projectIndex: number
}

interface ProjectDot {
  label: string; sublabel: string; route: string
  xPct: number; yPct: number
  orbitType: 'radial' | 'stream' | 'pulse' | 'spiral'
  dotIndex: number
  id: string
}

interface Ripple { x: number; y: number; t: number; maxT: number }

interface Expansion {
  x: number; y: number; startTime: number; duration: number
  route: string; bgColor: string
}

const PROJECT_CONFIGS = [
  { id: 'influence', label: 'Influence Graph',    sublabel: 'Salesloft · 2024', route: '/work/influence-graph',    xPct: 0.30, yPct: 0.35, orbitType: 'radial'  as const },
  { id: 'ai_email',  label: 'AI Email Assistant', sublabel: 'Salesloft · 2023', route: '/work/ai-email-assistant', xPct: 0.62, yPct: 0.28, orbitType: 'stream'  as const },
  { id: 'github',    label: 'GitHub',             sublabel: 'Microsoft · 2022', route: '/work/github',             xPct: 0.22, yPct: 0.65, orbitType: 'pulse'   as const },
  { id: 'sony',      label: 'Sony',               sublabel: 'Sony · 2021',      route: '/work/sony',               xPct: 0.68, yPct: 0.62, orbitType: 'spiral'  as const },
]

const DOT_COUNT          = 600
const CURSOR_RADIUS      = 80
const PROJECT_HOVER_RADIUS = 120
const PROJECT_CLUSTER_RADIUS = 150

// ── Patronus particle ────────────────────────────────────────────────────────
interface PatronParticle {
  nx: number; ny: number   // normalized shape position
  x: number;  y: number   // current canvas pos
  sx: number; sy: number  // scatter start (reveal only)
  opacity: number; size: number; phase: number
}

function buildPatronParticles(patron: PatronData, count: number, rng: () => number): PatronParticle[] {
  const shape = SHAPES[patron.animal]
  return Array.from({ length: count }, (_, i) => {
    const pt = shape[i % shape.length]
    return { nx: pt.x, ny: pt.y, x: 0, y: 0, sx: 0, sy: 0,
      opacity: 0.7 + rng() * 0.25, size: 1.2 + rng() * 1.0, phase: rng() * Math.PI * 2 }
  })
}

// ── Props ────────────────────────────────────────────────────────────────────
export interface HeroCanvasProps {
  onHoverProject: (id: string | null) => void
  onHoverPatron:  (patron: PatronData | null) => void
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HeroCanvas({ onHoverProject, onHoverPatron }: HeroCanvasProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number>(0)
  const dotsRef    = useRef<Dot[]>([])
  const projRef    = useRef<ProjectDot[]>([])
  const mouseRef   = useRef({ x: -9999, y: -9999 })
  const hovProjRef = useRef<number>(-1)
  const labelOpaRef = useRef<number[]>([0, 0, 0, 0])
  const ripplesRef = useRef<Ripple[]>([])
  const expansionRef = useRef<Expansion | null>(null)
  const navigatingRef = useRef(false)
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const themeRef = useRef(resolvedTheme)
  const frameRef = useRef(0)

  // Patronus refs
  const currentPatronRef   = useRef<PatronData | null>(null)
  const revealParticlesRef = useRef<PatronParticle[]>([])
  const fieldParticlesRef  = useRef<Map<string, PatronParticle[]>>(new Map())
  const revealPhaseRef     = useRef<'emerge'|'present'|'migrate'|'settled'|'none'>('none')
  const revealStartRef     = useRef(0)
  const revealDimRef       = useRef(1)
  const hovPatronRef       = useRef<PatronData | null>(null)
  const hovProjIdRef       = useRef<string | null>(null)

  // React state for overlay
  const [patronName, setPatronName] = useState('')
  const [showLine1, setShowLine1]   = useState(false)
  const [showLine2, setShowLine2]   = useState(false)
  const [revealActive, setRevealActive] = useState(false)

  useEffect(() => { themeRef.current = resolvedTheme }, [resolvedTheme])

  // ── Patronus initialisation ───────────────────────────────────────────────
  useEffect(() => {
    const patron = getOrCreatePatron()
    currentPatronRef.current = patron
    setPatronName(patron.name)

    const isReturning = hasVisitedBefore()
    const rng = mulberry32(hashString(patron.id))

    if (isReturning) {
      revealPhaseRef.current = 'settled'
      revealParticlesRef.current = buildPatronParticles(patron, 18, rng)
    } else {
      revealPhaseRef.current = 'emerge'
      revealStartRef.current = performance.now()
      revealParticlesRef.current = buildPatronParticles(patron, 120, rng)
      setRevealActive(true)
      setTimeout(() => setShowLine1(true), 800)
      setTimeout(() => setShowLine2(true), 1400)
      setTimeout(() => { setShowLine1(false); setShowLine2(false); setRevealActive(false) }, 3200)
      setTimeout(() => markVisited(), 5000)
    }
    setLastVisit()

    // No seeded patrons — single ephemeral patronus only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Build dots (existing) ─────────────────────────────────────────────────
  const buildDots = useCallback((w: number, h: number) => {
    const rng = mulberry32Local(42)
    const dots: Dot[] = []
    const projectDots: ProjectDot[] = PROJECT_CONFIGS.map((cfg, i) => ({ ...cfg, dotIndex: i }))

    for (let i = 0; i < PROJECT_CONFIGS.length; i++) {
      const cfg = PROJECT_CONFIGS[i]
      const hx = cfg.xPct * w, hy = cfg.yPct * h
      const grainOffsets = Array.from({ length: 4 }, () => ({
        dx: (rng()-0.5)*2, dy: (rng()-0.5)*2, opacity: 0.5+rng()*0.4,
      }))
      dots.push({ hx, hy, x: hx, y: hy, vx:0, vy:0, size:5, phase: rng()*Math.PI*2,
        driftAmp: 1.5, driftSpeed: 0.0005+rng()*0.0003, grainOffsets, projectIndex: i })
    }

    const clusters: Array<{cx:number;cy:number}> = []
    for (let c = 0; c < 18; c++) clusters.push({ cx: rng()*w, cy: rng()*h })

    for (let i = 0; i < DOT_COUNT - PROJECT_CONFIGS.length; i++) {
      let hx: number, hy: number
      if (rng() < 0.7) {
        const cl = clusters[Math.floor(rng()*clusters.length)]
        hx = cl.cx + (rng()-0.5)*w*0.28; hy = cl.cy + (rng()-0.5)*h*0.28
      } else { hx = rng()*w; hy = rng()*h }
      hx = Math.max(4, Math.min(w-4, hx)); hy = Math.max(4, Math.min(h-4, hy))
      const gc = 3 + Math.floor(rng()*3)
      const grainOffsets = Array.from({ length: gc }, () => ({
        dx: (rng()-0.5)*2, dy: (rng()-0.5)*2, opacity: 0.4+rng()*0.5,
      }))
      dots.push({ hx, hy, x:hx, y:hy, vx:0, vy:0, size: 2+rng(), phase: rng()*Math.PI*2,
        driftAmp: 1.5+rng()*1.5, driftSpeed: 0.0003+rng()*0.0007, grainOffsets, projectIndex: -1 })
    }
    dotsRef.current = dots
    projRef.current = projectDots
  }, [])

  // ── Draw grainy background dot (existing) ─────────────────────────────────
  const drawGrainyDot = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number, size: number,
    grainOffsets: Dot['grainOffsets'], baseColor: string,
  ) => {
    for (const g of grainOffsets) {
      ctx.beginPath()
      ctx.arc(x+g.dx, y+g.dy, size*(0.6+Math.random()*0.5), 0, Math.PI*2)
      ctx.fillStyle = baseColor; ctx.globalAlpha = g.opacity; ctx.fill()
    }
    ctx.globalAlpha = 1
  }, [])

  // ── Draw a grainy patronus particle ──────────────────────────────────────
  const drawGrainPx = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number, size: number, opacity: number,
    frame: number, pidx: number, inkColor: string,
  ) => {
    const jitter = ((frame >> 1) + pidx * 7) % 16
    const jx = (jitter % 4 - 1.5) * 0.5
    const jy = (Math.floor(jitter / 4) - 1.5) * 0.5
    ctx.fillStyle = inkColor; ctx.globalAlpha = opacity
    ctx.fillRect(x+jx, y+jy, size, size)
    if (pidx % 5 === 0) {
      ctx.globalAlpha = opacity * 0.5
      ctx.fillRect(x+jx+1, y+jy+1, size+0.5, size+0.5)
    }
    ctx.globalAlpha = 1
  }, [])

  // ── Main animation loop ───────────────────────────────────────────────────
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = themeRef.current === 'dark'
    const bgColor  = isDark ? '#1a1918' : '#f2f0eb'
    const inkColor = isDark ? '#ede9e3' : '#1c1b19'
    const inkFaint = isDark ? '#605d58' : '#b0ada7'
    const now = performance.now()
    const frame = frameRef.current++
    const W = canvas.width, H = canvas.height
    const { x: mx, y: my } = mouseRef.current
    const dots = dotsRef.current
    const projectDots = projRef.current

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H)

    // ── Expansion animation ───────────────────────────────────────────────
    if (expansionRef.current) {
      const exp = expansionRef.current
      const elapsed = now - exp.startTime
      const progress = Math.min(elapsed / exp.duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const maxR = Math.sqrt(W**2 + H**2)
      ctx.beginPath(); ctx.arc(exp.x, exp.y, eased*maxR, 0, Math.PI*2)
      ctx.fillStyle = exp.bgColor; ctx.fill()
      if (progress >= 1 && !navigatingRef.current) {
        navigatingRef.current = true
        sessionStorage.setItem('expandOrigin', JSON.stringify({ x: exp.x, y: exp.y }))
        router.push(exp.route)
      }
    }

    // ── Background dot pass ───────────────────────────────────────────────
    const bgDim = revealDimRef.current
    ctx.globalAlpha = bgDim

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i]
      const isProject = dot.projectIndex >= 0
      const pIdx = dot.projectIndex

      const driftX = Math.sin(now*dot.driftSpeed + dot.phase)*dot.driftAmp
      const driftY = Math.cos(now*dot.driftSpeed*0.7 + dot.phase+1.2)*dot.driftAmp
      const dx = mx - dot.x, dy = my - dot.y
      const dist = Math.sqrt(dx*dx + dy*dy)

      let extraX = 0, extraY = 0
      if (dist < CURSOR_RADIUS && dist > 0) {
        const factor = 0.03*(1 - dist/CURSOR_RADIUS)
        extraX = dx*factor; extraY = dy*factor
        const tangX = -dy/dist, tangY = dx/dist
        const os = 0.4*(1 - dist/CURSOR_RADIUS)
        extraX += tangX*os; extraY += tangY*os
      }

      let pfX = 0, pfY = 0
      if (!isProject && hovProjRef.current >= 0) {
        const pd = projectDots[hovProjRef.current]
        const pdot = dots[pd.dotIndex]
        const pdx = pdot.x - dot.x, pdy = pdot.y - dot.y
        const pdist = Math.sqrt(pdx*pdx + pdy*pdy)
        if (pdist < PROJECT_CLUSTER_RADIUS && pdist > 0) {
          const s = 0.02*(1 - pdist/PROJECT_CLUSTER_RADIUS)
          const ot = pd.orbitType
          if (ot === 'radial') {
            const a = Math.atan2(pdy, pdx), sa = Math.round(a/(Math.PI/4))*(Math.PI/4)
            pfX = Math.cos(sa)*pdist*s*0.5; pfY = Math.sin(sa)*pdist*s*0.5
          } else if (ot === 'stream') {
            pfX = pdx*s; pfY = pdy*s*0.2
          } else if (ot === 'pulse') {
            const pulse = Math.sin(now*0.003)*0.5+0.5
            pfX = pdx*s*pulse; pfY = pdy*s*pulse
          } else {
            const sa = Math.atan2(pdy, pdx)+now*0.001
            pfX = Math.cos(sa)*s*8; pfY = Math.sin(sa)*s*8
          }
        }
      }

      if (expansionRef.current) {
        const exp = expansionRef.current
        const edx = dot.x-exp.x, edy = dot.y-exp.y
        const edist = Math.sqrt(edx*edx + edy*edy)
        if (edist > 0) { const sc=3/(edist+1); dot.vx+=edx/edist*sc*4; dot.vy+=edy/edist*sc*4 }
      }

      dot.vx *= 0.92; dot.vy *= 0.92
      dot.vx += (dot.hx+driftX-dot.x)*0.04; dot.vy += (dot.hy+driftY-dot.y)*0.04
      dot.x += dot.vx+extraX+pfX; dot.y += dot.vy+extraY+pfY

      if (isProject) {
        ctx.globalAlpha = 0.15*bgDim
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 14, 0, Math.PI*2)
        ctx.strokeStyle = inkColor; ctx.lineWidth = 0.8; ctx.stroke()
        if (hovProjRef.current === pIdx) {
          ctx.globalAlpha = 0.08*bgDim
          ctx.beginPath(); ctx.arc(dot.x, dot.y, 22, 0, Math.PI*2); ctx.stroke()
        }
        ctx.globalAlpha = bgDim
      }
      ctx.globalAlpha = bgDim
      drawGrainyDot(ctx, dot.x, dot.y, dot.size, dot.grainOffsets, inkColor)
    }

    ctx.globalAlpha = 1

    // ── Project labels ────────────────────────────────────────────────────
    for (let i = 0; i < projectDots.length; i++) {
      const pd = projectDots[i]
      const pdot = dots[pd.dotIndex]
      const opa = labelOpaRef.current[i]
      if (opa > 0.01) {
        ctx.globalAlpha = opa*bgDim
        ctx.font = `400 11px var(--font-ibm-plex-mono,monospace)`
        ctx.textAlign = 'center'; ctx.fillStyle = inkColor
        ctx.fillText(pd.label.toUpperCase(), pdot.x, pdot.y+26)
        ctx.font = `300 10px var(--font-ibm-plex-mono,monospace)`
        ctx.fillStyle = inkFaint; ctx.fillText(pd.sublabel, pdot.x, pdot.y+40)
        ctx.globalAlpha = 1
      }
    }

    // ── Ripples ───────────────────────────────────────────────────────────
    ripplesRef.current = ripplesRef.current.filter(r => now-r.t < r.maxT)
    for (const r of ripplesRef.current) {
      const el = now-r.t, prog = el/r.maxT
      for (let ring=0; ring<3; ring++) {
        const rp = Math.max(0, prog - ring*0.12)
        if (rp <= 0) continue
        ctx.beginPath(); ctx.arc(r.x, r.y, rp*60, 0, Math.PI*2)
        ctx.strokeStyle = inkColor; ctx.globalAlpha = (1-rp)*0.4; ctx.lineWidth=1; ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    // ── Label opacity lerp ────────────────────────────────────────────────
    for (let i=0; i<4; i++) {
      const target = hovProjRef.current === i ? 1 : 0
      labelOpaRef.current[i] += (target - labelOpaRef.current[i])*0.1
    }

    // ── Single ephemeral patronus (current visitor only) ─────────────────
    const cur = currentPatronRef.current
    const allPatrons = cur && revealPhaseRef.current === 'settled' ? [cur] : []

    let newHovPatron: PatronData | null = null
    for (const patron of allPatrons) {
      const cx = patron.fieldX*W, cy = patron.fieldY*H
      const ddx = mx-cx, ddy = my-cy
      const nearCursor = Math.sqrt(ddx*ddx+ddy*ddy) < 22
      if (nearCursor) newHovPatron = patron

      const isCur = !!patron.isCurrentVisitor
      const baseOpa = isCur ? 0.13 : 0.06
      const opaMulti = nearCursor ? (0.55/baseOpa) : 1
      const SIZE = 28

      const particles = isCur
        ? (revealPhaseRef.current==='settled' ? revealParticlesRef.current : null)
        : (fieldParticlesRef.current.get(patron.id) ?? [])
      if (!particles) continue

      for (let i=0; i<particles.length; i++) {
        const p = particles[i]
        const hx = cx + (p.nx-0.5)*SIZE
        const hy = cy + (p.ny-0.5)*SIZE
        const drift = Math.sin(now*0.0008+p.phase)*1.5
        const driftY2 = Math.cos(now*0.0006+p.phase)*1.5
        p.x = hx+drift; p.y = hy+driftY2
        const opa = Math.max(0, Math.min(1, baseOpa*opaMulti*p.opacity + Math.sin(now*0.003+p.phase)*0.04))
        drawGrainPx(ctx, p.x, p.y, p.size, opa, frame, i, inkColor)
      }

      if (nearCursor) {
        ctx.font = `9px var(--font-ibm-plex-mono,monospace)`
        ctx.fillStyle = inkFaint; ctx.globalAlpha = 0.55; ctx.textAlign = 'left'
        ctx.fillText(patron.name, cx-20, cy-SIZE/2-6); ctx.globalAlpha=1
      }
    }

    if (newHovPatron?.id !== hovPatronRef.current?.id) {
      hovPatronRef.current = newHovPatron; onHoverPatron(newHovPatron)
    }

    // ── Current visitor reveal animation ─────────────────────────────────
    if (cur && revealPhaseRef.current !== 'settled' && revealPhaseRef.current !== 'none') {
      const elapsed = now - revealStartRef.current
      const CX = W/2, CY = H/2
      const ps = revealParticlesRef.current

      if (revealPhaseRef.current === 'emerge') {
        revealDimRef.current = 0.3
        const progress = Math.min(elapsed/800, 1)
        for (let i=0; i<ps.length; i++) {
          const p = ps[i]
          const homeX = CX+(p.nx-0.5)*180, homeY = CY+(p.ny-0.5)*180
          if (p.sx===0 && p.sy===0) {
            const srng = mulberry32(hashString(cur.id)^i)
            p.sx = CX+(srng()-0.5)*400; p.sy = CY+(srng()-0.5)*400
            p.x = p.sx; p.y = p.sy
          }
          p.x += (homeX-p.x)*0.06; p.y += (homeY-p.y)*0.06
          drawGrainPx(ctx, p.x, p.y, p.size*2, p.opacity*progress*0.85, frame, i, inkColor)
        }
        if (progress >= 1) revealPhaseRef.current = 'present'

      } else if (revealPhaseRef.current === 'present') {
        revealDimRef.current = 0.3
        const breathe = 1 + 0.03*Math.sin((elapsed-800)/1500*Math.PI*2)
        for (let i=0; i<ps.length; i++) {
          const p = ps[i]
          const homeX = CX+(p.nx-0.5)*180*breathe, homeY = CY+(p.ny-0.5)*180*breathe
          p.x += (homeX-p.x)*0.12; p.y += (homeY-p.y)*0.12
          const opa = p.opacity*0.85 + Math.sin(now*0.004+p.phase)*0.04
          drawGrainPx(ctx, p.x, p.y, p.size*2, opa, frame, i, inkColor)
        }
        if (elapsed > 3200) revealPhaseRef.current = 'migrate'

      } else if (revealPhaseRef.current === 'migrate') {
        const t = Math.min((elapsed-3200)/1800, 1)
        const ease = t*t*(3-2*t)
        revealDimRef.current = 0.3+0.7*ease
        const fCX = cur.fieldX*W, fCY = cur.fieldY*H
        for (let i=0; i<ps.length; i++) {
          const p = ps[i]
          const targetX = fCX+(p.nx-0.5)*28, targetY = fCY+(p.ny-0.5)*28
          const revX = CX+(p.nx-0.5)*180, revY = CY+(p.ny-0.5)*180
          const hx2 = revX+(targetX-revX)*ease, hy2 = revY+(targetY-revY)*ease
          p.x += (hx2-p.x)*0.15; p.y += (hy2-p.y)*0.15
          const pSize = p.size*2 - p.size*ease
          drawGrainPx(ctx, p.x, p.y, pSize, p.opacity*(0.85-(0.85-0.25)*ease), frame, i, inkColor)
        }
        if (t >= 1) {
          revealPhaseRef.current = 'settled'
          revealDimRef.current = 1
          revealParticlesRef.current = ps.slice(0, 18)
        }
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [drawGrainyDot, drawGrainPx, onHoverPatron, router])

  // ── Mouse / interaction handlers ─────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx = canvas.width/rect.width, sy = canvas.height/rect.height
    mouseRef.current = { x: (e.clientX-rect.left)*sx, y: (e.clientY-rect.top)*sy }

    const dots = dotsRef.current, pds = projRef.current
    let hov = -1
    for (let i=0; i<pds.length; i++) {
      const pd = pds[i], pdot = dots[pd.dotIndex]
      const dx = mouseRef.current.x-pdot.x, dy = mouseRef.current.y-pdot.y
      if (Math.sqrt(dx*dx+dy*dy) < PROJECT_HOVER_RADIUS) { hov=i; break }
    }
    if (hov !== hovProjRef.current) {
      hovProjRef.current = hov
      onHoverProject(hov >= 0 ? pds[hov].id : null)
    }
    canvas.style.cursor = hov >= 0 ? 'pointer' : 'default'
  }, [onHoverProject])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x:-9999, y:-9999 }
    if (hovProjRef.current !== -1) { hovProjRef.current = -1; onHoverProject(null) }
    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = 'default'
  }, [onHoverProject])

  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx = canvas.width/rect.width, sy = canvas.height/rect.height
    const cx = (e.clientX-rect.left)*sx, cy = (e.clientY-rect.top)*sy
    const dots = dotsRef.current, pds = projRef.current
    for (let i=0; i<pds.length; i++) {
      const pd = pds[i], pdot = dots[pd.dotIndex]
      const dx = cx-pdot.x, dy = cy-pdot.y
      if (Math.sqrt(dx*dx+dy*dy) < PROJECT_HOVER_RADIUS) {
        ripplesRef.current.push({ x:pdot.x, y:pdot.y, t:performance.now(), maxT:400 })
        const bg = themeRef.current === 'dark' ? '#1a1918' : '#f2f0eb'
        expansionRef.current = { x:pdot.x, y:pdot.y, startTime:performance.now(), duration:500, route:pd.route, bgColor:bg }
        break
      }
    }
  }, [])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const par = canvas.parentElement
    if (par) { canvas.width = par.offsetWidth; canvas.height = par.offsetHeight }
    buildDots(canvas.width, canvas.height)
  }, [buildDots])

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const par = canvas.parentElement
    if (par) { canvas.width = par.offsetWidth; canvas.height = par.offsetHeight }
    buildDots(canvas.width, canvas.height)

    const originStr = sessionStorage.getItem('collapseTarget')
    if (originStr) {
      sessionStorage.removeItem('collapseTarget')
      const ds = dotsRef.current
      for (const dot of ds) {
        const angle = Math.random()*Math.PI*2
        const dist = Math.max(canvas.width, canvas.height)
        dot.x = dot.hx+Math.cos(angle)*dist*0.8; dot.y = dot.hy+Math.sin(angle)*dist*0.8
        dot.vx = (dot.hx-dot.x)*0.02; dot.vy = (dot.hy-dot.y)*0.02
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('click', handleClick)
    window.addEventListener('resize', handleResize)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
    }
  }, [animate, buildDots, handleMouseMove, handleMouseLeave, handleClick, handleResize])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />

      {/* Reveal text overlay */}
      <AnimatePresence>
        {revealActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', pointerEvents:'none' }}
          >
            <div style={{ height: '120px' }} />
            <AnimatePresence>
              {showLine1 && (
                <motion.p key="l1"
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  transition={{ duration: 0.4 }}
                  style={{ fontFamily:'var(--font-playfair)', fontSize:'18px',
                    fontStyle:'italic', fontWeight:400, color:'var(--ink)' }}
                >
                  you are {patronName}.
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showLine2 && (
                <motion.p key="l2"
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  transition={{ duration: 0.4 }}
                  style={{ fontFamily:'var(--font-ibm-plex-mono)', fontSize:'11px',
                    color:'var(--ink-muted)', marginTop:'8px', letterSpacing:'0.04em' }}
                >
                  your mark has been left in the field.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
