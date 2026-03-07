'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import RightPanel from '@/components/RightPanel'
import PatronGreeting from '@/components/PatronGreeting'
import { PatronData } from '@/lib/patronus'
import { PROJECTS } from '@/lib/projects'

const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), { ssr: false })

// ── Project full-screen section ────────────────────────────────────────────
function ProjectSection({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const router = useRouter()
  return (
    <section
      data-section={`project-${project.id}`}
      style={{ height: '100vh', scrollSnapAlign: 'start', flexShrink: 0,
        display: 'grid', gridTemplateColumns: '42% 58%',
        borderTop: '1px solid var(--border)', position: 'relative' }}
    >
      {/* Left: text */}
      <div style={{ padding: '64px 48px 64px 60px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', borderRight: '1px solid var(--border)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)',
            marginBottom: '32px' }}>
            {String(index + 1).padStart(2, '0')} · {project.company} · {project.year}
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '20px' }}>
            {project.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12px',
            fontStyle: 'italic', color: 'var(--ink-muted)', lineHeight: 1.7,
            maxWidth: '340px', marginBottom: '28px' }}>
            {project.hmw}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {project.tags.map(t => (
              <span key={t} style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid var(--border)', borderRadius: '2px',
                padding: '3px 7px', color: 'var(--ink-muted)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          {project.stats && project.stats.length > 0 && (
            <div style={{ display: 'flex', gap: '28px', marginBottom: '20px' }}>
              {project.stats.map(stat => (
                <div key={stat.label}>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(22px, 2.5vw, 34px)',
                    fontWeight: 400, color: 'var(--ink)', lineHeight: 1, marginBottom: '3px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px',
                    color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push(project.route)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)',
              display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            View case study →
          </button>
        </div>
      </div>

      {/* Right: media placeholder */}
      <div className="stripe-pattern" style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
          color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
          {project.title} — image / video
        </span>
      </div>
    </section>
  )
}

// ── Scroll arrow ───────────────────────────────────────────────────────────
function ScrollArrow() {
  return (
    <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
      <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
        <line x1="5" y1="0" x2="5" y2="10" stroke="var(--ink-faint)" strokeWidth="1" />
        <polyline points="1,6.5 5,11 9,6.5" fill="none" stroke="var(--ink-faint)" strokeWidth="1" />
      </svg>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState('hero')
  const [canvasHovProj, setCanvasHovProj] = useState<string | null>(null)
  const [hoveredPatron, setHoveredPatron] = useState<PatronData | null>(null)
  const [scrolled, setScrolled]           = useState(false)
  const [cursorPos, setCursorPos]         = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor]       = useState(false)

  // ── IntersectionObserver for active section (runs inside the container) ──
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const sections = container.querySelectorAll('[data-section]')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            setActiveSection(e.target.getAttribute('data-section') ?? 'hero')
          }
        })
      },
      { root: container, threshold: 0.5 }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // ── Scroll hint fades after first scroll ─────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 40)
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  const handleHeroMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY })
    setShowCursor(true)
  }, [])

  return (
    <>
      {/* Cursor label — hero only */}
      <AnimatePresence>
        {showCursor && activeSection === 'hero' && !scrolled && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', left: cursorPos.x + 14, top: cursorPos.y + 10,
              pointerEvents: 'none', zIndex: 200,
              fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
              textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)' }}>
            scroll ↓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed overlays */}
      <PatronGreeting />
      <RightPanel
        activeSection={activeSection}
        canvasHovProj={canvasHovProj}
        hoveredPatron={hoveredPatron}
      />

      {/* ── Snap-scroll container ────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ height: '100vh', overflowY: 'scroll',
          scrollSnapType: 'y mandatory', background: 'var(--bg)' }}
      >

        {/* ── 1. Hero ──────────────────────────────────────────────── */}
        <section
          data-section="hero"
          style={{ height: '100vh', scrollSnapAlign: 'start', flexShrink: 0,
            position: 'relative', overflow: 'hidden' }}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={() => setShowCursor(false)}
        >
          <HeroCanvas
            onHoverProject={setCanvasHovProj}
            onHoverPatron={setHoveredPatron}
          />
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                style={{ position: 'absolute', bottom: '28px', left: '50%',
                  transform: 'translateX(-50%)', pointerEvents: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
                  textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--ink-faint)' }}>
                  scroll for work
                </span>
                <ScrollArrow />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── 2–5. Work (one project per screen) ───────────────────── */}
        {PROJECTS.map((project, i) => (
          <ProjectSection key={project.id} project={project} index={i} />
        ))}

        {/* ── 6. Explorations ──────────────────────────────────────── */}
        <section
          data-section="explorations"
          style={{ height: '100vh', scrollSnapAlign: 'start', flexShrink: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '80px 60px', borderTop: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
            textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-faint)',
            marginBottom: '28px' }}>
            Explorations
          </p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 400, color: 'var(--ink)', lineHeight: 1.05, marginBottom: '28px',
            maxWidth: '600px' }}>
            Side projects, experiments, and ideas in motion.
          </h2>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12px',
            color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: '420px' }}>
            A collection of independent explorations — generative art, interactive systems,
            design tools, and things that don't fit neatly into a case study.
          </p>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
            color: 'var(--ink-faint)', marginTop: '40px', letterSpacing: '0.04em' }}>
            Coming soon.
          </p>
        </section>

        {/* ── 7. About ─────────────────────────────────────────────── */}
        <section
          data-section="about"
          style={{ height: '100vh', scrollSnapAlign: 'start', flexShrink: 0,
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            borderTop: '1px solid var(--border)' }}
        >
          {/* Left */}
          <div style={{ padding: '80px 56px 80px 60px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', borderRight: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
                textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-faint)',
                marginBottom: '28px' }}>
                About
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 3.5vw, 48px)',
                fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '24px' }}>
                Harshita Shyale
              </h2>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12.5px',
                color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: '360px', marginBottom: '20px' }}>
                Product designer with a background in computer science and theatre — specializing
                in human-centered AI interfaces and the systems that hold them together.
              </p>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12.5px',
                color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: '360px' }}>
                Currently at Salesloft, previously at Microsoft / GitHub, and Sony.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
                color: 'var(--ink-faint)', marginBottom: '6px' }}>
                M.S. Computer Science · University of Washington · 2022
              </p>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
                color: 'var(--ink-faint)', marginBottom: '20px' }}>
                B.E. Computer Science · 2020
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href="mailto:hello@harshitashyale.com"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
                    color: 'var(--ink-muted)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                  hello@harshitashyale.com
                </a>
              </div>
            </div>
          </div>

          {/* Right: photo placeholder */}
          <div className="stripe-pattern" style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px',
              color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
              Portrait
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '24px 60px', display: 'flex', justifyContent: 'space-between',
          borderTop: '1px solid var(--border)', scrollSnapAlign: 'none' }}>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
            Designed &amp; developed by Harshita · © 2025
          </span>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
            harshitashyale.com
          </span>
        </footer>
      </div>
    </>
  )
}
