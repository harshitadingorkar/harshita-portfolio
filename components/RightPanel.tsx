'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PatronData, SHAPES, timeAgo, mulberry32, hashString } from '@/lib/patronus'

// ── Transitions ──────────────────────────────────────────────────────────────
const SPRING = { duration: 0.38, ease: 'easeOut' } as const
const FADE   = { duration: 0.18, ease: 'easeInOut' } as const

// ── Project content ───────────────────────────────────────────────────────────
const PROJECT_INFO: Record<string, {
  title: string; descriptor: string; impact: string; rationale: string; route: string; cta: string
}> = {
  influence: {
    title: 'Influence Graph',
    descriptor: 'AI-powered relationship intelligence for enterprise sales',
    impact: '0→1 feature · 2024',
    rationale: 'Mapping hidden buying group relationships. An AI graph that makes invisible networks legible to revenue teams.',
    route: '/work/influence-graph', cta: 'VIEW CASE STUDY →',
  },
  ai_email: {
    title: 'AI Email Assistant',
    descriptor: 'Generative AI email with built-in explainability',
    impact: 'Shipped · Q3 2024',
    rationale: 'Redesigning AI-assisted outreach with explainability built in. Reps build intuition, not just click accept.',
    route: '/work/ai-email-assistant', cta: 'VIEW CASE STUDY →',
  },
  github: {
    title: 'GitHub Pull Requests',
    descriptor: 'UX research and systems design for code review',
    impact: '50M+ Active Users',
    rationale: 'Rethinking the pull request review experience for 50M+ developers globally.',
    route: '/work/github', cta: 'VIEW CASE STUDY →',
  },
  sony: {
    title: 'Sony Audio',
    descriptor: 'Consumer research and hardware-software interaction',
    impact: 'Consumer Research · 2022',
    rationale: 'Research-led exploration of device onboarding — finding friction and delight in unexpected places.',
    route: '/work/sony', cta: 'VIEW DECK →',
  },
}

// ── Dashed rule ───────────────────────────────────────────────────────────────
const HR = () => (
  <div style={{ borderBottom: '1px dashed var(--border)', margin: '0' }} />
)

// ── Accordion row ─────────────────────────────────────────────────────────────
function AccordionRow({
  symbol, label, open, onToggle, children,
}: {
  symbol: string; label: string; open: boolean
  onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '11px 20px',
          background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px',
            color: 'var(--ink-muted)', lineHeight: 1 }}>
            {symbol}
          </span>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
            letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink)' }}>
            {label}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '14px',
            color: 'var(--ink-faint)', lineHeight: 1, display: 'block' }}
        >
          +
        </motion.span>
      </button>
      <HR />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Patron mini canvas ────────────────────────────────────────────────────────
function PatronMiniCanvas({ patron }: { patron: PatronData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const frameRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 56; canvas.height = 56

    const shape = SHAPES[patron.animal]
    const rng = mulberry32(hashString(patron.id) ^ 0xabc)
    const particles = Array.from({ length: 28 }, (_, i) => {
      const pt = shape[i % shape.length]
      return { nx: pt.x, ny: pt.y, opacity: 0.45 + rng() * 0.35, size: 1 + rng() * 0.7, phase: rng() * Math.PI * 2 }
    })

    const loop = () => {
      const now = performance.now()
      const frame = frameRef.current++
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1c1b19'
      ctx.clearRect(0, 0, 56, 56)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const x = (p.nx - 0.5) * 52 + 28 + Math.sin(now * 0.0008 + p.phase) * 1.0
        const y = (p.ny - 0.5) * 52 + 28 + Math.cos(now * 0.0006 + p.phase) * 1.0
        const j = ((frame >> 1) + i * 7) % 16
        const jx = (j % 4 - 1.5) * 0.4, jy = (Math.floor(j / 4) - 1.5) * 0.4
        const opa = Math.max(0, Math.min(1, p.opacity * 0.7 + Math.sin(now * 0.003 + p.phase) * 0.04))
        ctx.fillStyle = ink; ctx.globalAlpha = opa
        ctx.fillRect(x + jx, y + jy, p.size, p.size)
        if (i % 5 === 0) { ctx.globalAlpha = opa * 0.4; ctx.fillRect(x + jx + 0.5, y + jy + 0.5, p.size + 0.3, p.size + 0.3) }
        ctx.globalAlpha = 1
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [patron])

  return <canvas ref={canvasRef} style={{ width: 56, height: 56, display: 'block' }} />
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface RightPanelProps {
  activeSection: string
  canvasHovProj: string | null
  hoveredPatron: PatronData | null
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export default function RightPanel({ activeSection, canvasHovProj, hoveredPatron }: RightPanelProps) {
  const router = useRouter()
  const [bodyOpen, setBodyOpen] = useState(true)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [ctaHov, setCtaHov] = useState(false)

  // Derive active project
  const activeProjectId = activeSection.startsWith('project-')
    ? activeSection.replace('project-', '')
    : (activeSection === 'hero' ? canvasHovProj : null)

  const panelState: 'patron' | 'project' | 'default' =
    hoveredPatron ? 'patron' : activeProjectId ? 'project' : 'default'

  const proj = activeProjectId ? PROJECT_INFO[activeProjectId] : null

  // Auto-expand WORK accordion when scrolled to a project
  useEffect(() => {
    if (activeSection.startsWith('project-')) setOpenAccordion('work')
    else if (activeSection === 'about') setOpenAccordion('about')
    else if (activeSection === 'explorations') setOpenAccordion('explorations')
  }, [activeSection])

  // Re-open body when state changes to project/patron (in case it was closed)
  useEffect(() => {
    if (panelState !== 'default') setBodyOpen(true)
  }, [panelState])

  return (
    <div
      className="hidden md:block"
      style={{ position: 'fixed', right: '40px', top: '50%', transform: 'translateY(-50%)',
        width: '260px', zIndex: 15 }}
    >
      {/* ── Card shell ────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)',
        borderRadius: '3px', overflow: 'hidden' }}>

        {/* ── Header (always visible — the "stick") ─────────────────── */}
        <button
          onClick={() => setBodyOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '16px 20px',
            background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '11px', lineHeight: 1 }}>●</span>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
              {panelState === 'project' && proj ? proj.title.split(' ')[0] : panelState === 'patron' ? 'Patron' : 'Index'}
            </span>
          </div>
          <motion.span
            animate={{ rotate: bodyOpen ? 0 : -90 }}
            transition={{ duration: 0.25 }}
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '13px',
              color: 'var(--ink-faint)', lineHeight: 1, display: 'block' }}
          >
            −
          </motion.span>
        </button>

        <HR />

        {/* ── Body (slides up to collapse) ──────────────────────────── */}
        <AnimatePresence initial={false}>
          {bodyOpen && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING}
              style={{ overflow: 'hidden' }}
            >
              {/* Inner content cross-fades between states */}
              <AnimatePresence mode="wait">

                {/* ── DEFAULT ───────────────────────────────────────── */}
                {panelState === 'default' && (
                  <motion.div key="default"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }} transition={FADE}
                  >
                    <div style={{ padding: '16px 20px' }}>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11.5px',
                        color: 'var(--ink-muted)', lineHeight: 1.75, textIndent: '1.2em' }}>
                        Harshita Shyale is a product designer and researcher. Her work lives at the
                        intersection of careful observation and AI systems —{' '}
                        <a href="#about" style={{ color: 'var(--ink-faint)',
                          textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          more information
                        </a>.
                      </p>
                    </div>
                    <HR />

                    <AccordionRow symbol="▲" label="Work"
                      open={openAccordion === 'work'}
                      onToggle={() => setOpenAccordion(o => o === 'work' ? null : 'work')}
                    >
                      <div style={{ paddingBottom: '4px' }}>
                        {Object.entries(PROJECT_INFO).map(([id, p]) => (
                          <button key={id} onClick={() => router.push(p.route)}
                            style={{ display: 'flex', justifyContent: 'space-between',
                              alignItems: 'baseline', width: '100%', background: 'none',
                              border: 'none', cursor: 'pointer', padding: '8px 20px',
                              fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px',
                              color: activeProjectId === id ? 'var(--ink)' : 'var(--ink-muted)',
                              textDecoration: 'none', transition: 'color 0.15s ease' }}>
                            <span>{p.title}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionRow>

                    <AccordionRow symbol="■" label="Explorations"
                      open={openAccordion === 'explorations'}
                      onToggle={() => setOpenAccordion(o => o === 'explorations' ? null : 'explorations')}
                    >
                      <div style={{ padding: '10px 20px 12px', fontFamily: 'var(--font-ibm-plex-mono)',
                        fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                        Side projects, experiments, and ideas in motion.
                      </div>
                    </AccordionRow>

                    <AccordionRow symbol="●" label="About"
                      open={openAccordion === 'about'}
                      onToggle={() => setOpenAccordion(o => o === 'about' ? null : 'about')}
                    >
                      <div style={{ padding: '10px 20px 12px', fontFamily: 'var(--font-ibm-plex-mono)',
                        fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                        <p style={{ marginBottom: '6px' }}>M.S. Computer Science · UW · 2022</p>
                        <p>Product Designer · Salesloft · 2022–present</p>
                      </div>
                    </AccordionRow>

                    <AccordionRow symbol="●" label="Contact"
                      open={openAccordion === 'contact'}
                      onToggle={() => setOpenAccordion(o => o === 'contact' ? null : 'contact')}
                    >
                      <div style={{ padding: '10px 20px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        {[
                          { text: 'hello@harshitashyale.com', href: 'mailto:hello@harshitashyale.com' },
                          { text: 'linkedin.com/in/harshitashyale', href: '#' },
                        ].map(l => (
                          <a key={l.href} href={l.href}
                            style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px',
                              color: 'var(--ink-muted)', textDecoration: 'none' }}>
                            {l.text}
                          </a>
                        ))}
                      </div>
                    </AccordionRow>
                    {/* Bottom breathing room */}
                    <div style={{ height: '6px' }} />
                  </motion.div>
                )}

                {/* ── PROJECT ───────────────────────────────────────── */}
                {panelState === 'project' && proj && (
                  <motion.div key={`proj-${activeProjectId}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }} transition={FADE}
                  >
                    <div style={{ padding: '18px 20px 0' }}>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '19px', fontStyle: 'italic',
                        fontWeight: 400, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '8px' }}>
                        {proj.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px',
                        color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '16px' }}>
                        {proj.descriptor}
                      </p>
                    </div>
                    <HR />
                    <div style={{ padding: '14px 20px 0' }}>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'var(--ink-faint)', marginBottom: '5px' }}>
                        Impact
                      </p>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '14px',
                        color: 'var(--ink)', fontWeight: 500, marginBottom: '16px' }}>
                        {proj.impact}
                      </p>
                    </div>
                    <HR />
                    <div style={{ padding: '14px 20px 0' }}>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10.5px',
                        color: 'var(--ink-muted)', lineHeight: 1.75, marginBottom: '16px' }}>
                        {proj.rationale}
                      </p>
                    </div>
                    <HR />
                    <div style={{ padding: '12px 20px 18px' }}>
                      <button
                        onClick={() => router.push(proj.route)}
                        onMouseEnter={() => setCtaHov(true)}
                        onMouseLeave={() => setCtaHov(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: ctaHov ? 'var(--accent)' : 'var(--ink)',
                          transition: 'color 0.15s ease' }}
                      >
                        {proj.cta}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── PATRON ────────────────────────────────────────── */}
                {panelState === 'patron' && hoveredPatron && (
                  <motion.div key={`patron-${hoveredPatron.id}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }} transition={FADE}
                  >
                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PatronMiniCanvas patron={hoveredPatron} />
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontStyle: 'italic',
                        fontWeight: 400, color: 'var(--ink)', marginTop: '12px', marginBottom: '4px' }}>
                        {hoveredPatron.name}
                      </p>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px',
                        color: 'var(--ink-faint)', letterSpacing: '0.04em', marginBottom: '8px' }}>
                        visited {timeAgo(hoveredPatron.createdAt)}
                      </p>
                      {hoveredPatron.isCurrentVisitor && (
                        <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
                          fontStyle: 'italic', color: 'var(--ink-muted)' }}>
                          this is you.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
