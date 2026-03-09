'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ── Mini IndexStrip — fixed top-right, replaces nav bar ──────────────────────
function IndexStrip({ router }: { router: ReturnType<typeof useRouter> }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', right: '32px', top: '32px', zIndex: 50,
        height: '36px', display: 'flex', alignItems: 'center', padding: '0 14px',
        background: 'rgba(242,240,235,0.92)',
        border: `1px solid ${hovered ? '#1c1b19' : '#c9c4bc'}`,
        borderRadius: '2px', backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s ease', cursor: 'default',
      }}
    >
      <button
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: '#6b6860' }}
        aria-label="Go home"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 5.5L6 1.5L11 5.5V11H8V8H4V11H1V5.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
        </svg>
      </button>
      <div style={{ width: '1px', height: '14px', background: '#c9c4bc', margin: '0 10px', flexShrink: 0 }} />
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" style={{ flexShrink: 0, marginRight: '7px' }}>
        <circle cx="2.5" cy="2.5" r="2.5" fill="#c84b2f" />
      </svg>
      <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1c1b19', whiteSpace: 'nowrap' }}>
        GitHub Pull Requests
      </span>
    </motion.div>
  )
}

// ── Tokens ─────────────────────────────────────────────────────────────────
const MONO   = 'var(--font-ibm-plex-mono), monospace'
const BODY   = 'var(--font-manrope), sans-serif'
const AVERIA = "'Averia Libre Serif', Georgia, serif"
const BG     = '#f2f0eb'
const INK    = '#1c1b19'
const MUTED  = '#6b6860'
const FAINT  = '#a8a49e'
const ACCENT = '#c84b2f'

// ── Section nav ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'context',  label: 'Context'  },
  { id: 'impact',   label: 'Impact'   },
  { id: 'solution', label: 'Solution' },
  { id: 'process',  label: 'Process'  },
]

const FOOTER_MSGS = [
  'this is where I learned the most',
  'still thinking about this one, genuinely',
  'if you made it here — thank you, really',
]

// ── Micro components ────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: MONO, fontSize: '8.5px',
      textTransform: 'uppercase', letterSpacing: '0.16em',
      color: FAINT, marginBottom: '10px',
    }}>
      {children}
    </p>
  )
}

function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: '14px', color: MUTED, lineHeight: 1.85, ...style }}>
      {children}
    </p>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: AVERIA, fontSize: 'clamp(22px, 2.2vw, 28px)',
      fontWeight: 400, color: INK, lineHeight: 1.2, marginBottom: '20px',
    }}>
      {children}
    </h2>
  )
}

function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{ margin: '32px 0', paddingLeft: '20px', borderLeft: `2px solid ${ACCENT}` }}>
      <p style={{
        fontFamily: AVERIA, fontSize: '20px', fontStyle: 'italic',
        fontWeight: 400, color: INK, lineHeight: 1.55,
      }}>
        {children}
      </p>
    </blockquote>
  )
}

function CaseImg({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', borderRadius: '6px', overflow: 'hidden', ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: '100%', display: 'block' }} />
    </motion.div>
  )
}

// ── Finding block ───────────────────────────────────────────────────────────
function Finding({
  number, headline, quote, body, imageSrc, imageAlt, solutionSrc, solutionAlt,
}: {
  number: string; headline: string; quote?: string; body: string
  imageSrc?: string; imageAlt?: string; solutionSrc: string; solutionAlt: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginTop: '52px' }}
    >
      <p style={{ fontFamily: MONO, fontSize: '8.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, marginBottom: '12px' }}>
        Finding {number}
      </p>
      <h3 style={{ fontFamily: AVERIA, fontSize: '20px', fontWeight: 400, color: INK, lineHeight: 1.3, marginBottom: '18px' }}>
        {headline}
      </h3>
      {quote && <Pullquote>{quote}</Pullquote>}
      <Body style={{ marginBottom: '24px' }}>{body}</Body>
      {imageSrc && <CaseImg src={imageSrc} alt={imageAlt ?? ''} style={{ marginBottom: '12px' }} />}
      <CaseImg src={solutionSrc} alt={solutionAlt} />
    </motion.div>
  )
}

// ── Sticky left column ───────────────────────────────────────────────────────
function StickyLeft({
  router, metricsOpacity,
}: {
  router: ReturnType<typeof useRouter>
  metricsOpacity: number
}) {
  const [active, setActive] = useState('context')

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.35
      let current = 'context'
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'sticky', top: '32px', display: 'flex', flexDirection: 'column' }}>

      <h1 style={{
        fontFamily: AVERIA, fontSize: '20px', fontWeight: 400,
        color: INK, lineHeight: 1.25, marginBottom: '16px',
      }}>
        GitHub Pull Requests
      </h1>

      <p style={{
        fontFamily: BODY, fontSize: '12px', fontStyle: 'italic',
        color: MUTED, lineHeight: 1.65, marginBottom: '28px',
      }}>
        How might we improve the code review process for better developer collaboration?
      </p>

      {/* Impact metrics — fade on scroll */}
      <div style={{
        opacity: metricsOpacity,
        transition: 'opacity 0.08s linear',
        marginBottom: '28px',
        paddingBottom: '28px',
        display: 'flex', flexDirection: 'column', gap: '18px',
      }}>
        {[
          { value: '60%', label: 'less mouse movement' },
          { value: '40%', label: 'faster file navigation' },
        ].map(m => (
          <div key={m.label}>
            <p style={{ fontFamily: AVERIA, fontSize: '40px', fontWeight: 400, color: INK, lineHeight: 1, marginBottom: '4px' }}>
              {m.value}
            </p>
            <p style={{ fontFamily: MONO, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: FAINT }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Section nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              fontFamily: MONO, fontSize: '10px', letterSpacing: '0.06em',
              color: active === id ? INK : FAINT,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px 0', textAlign: 'left',
              paddingLeft: active === id ? '10px' : '0',
              borderLeft: `1.5px solid ${active === id ? ACCENT : 'transparent'}`,
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </nav>

    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function GitHubPage() {
  const router = useRouter()

  const contextSentinelRef = useRef<HTMLDivElement>(null)
  const [metricsOpacity, setMetricsOpacity] = useState(1)

  useEffect(() => {
    const update = () => {
      const el = contextSentinelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setMetricsOpacity(Math.max(0, Math.min(1, rect.top / (window.innerHeight * 0.45))))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const footerRef = useRef<HTMLElement>(null)
  const [footerVisible, setFooterVisible] = useState(false)
  const [footerMsg] = useState(() => FOOTER_MSGS[Math.floor(Math.random() * FOOTER_MSGS.length)])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setFooterVisible(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ background: BG, minHeight: '100vh', color: INK }}>

      {/* ── Mini INDEX strip — fixed top-right ───────────────────────── */}
      <IndexStrip router={router} />

      {/* ── Hero image ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        style={{ padding: '80px 40px 0' }}
      >
        <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/work/github/hero-image.avif"
            alt="GitHub Pull Requests case study"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </motion.div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        maxWidth: '1160px',
        padding: '60px 40px 0',
      }}>

        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ paddingRight: '48px' }}
        >
          <StickyLeft router={router} metricsOpacity={metricsOpacity} />
        </motion.div>

        {/* Right column — no left border */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ paddingBottom: '100px', paddingLeft: '40px' }}
        >

          {/* ── Context ─────────────────────────────────────────── */}
          <section id="context">
            <Label>Context</Label>
            <SectionHead>Every piece of software you use was shaped by code review.</SectionHead>
            <Body>
              In early 2024, GitHub launched a redesigned pull request experience in beta — aimed at improving accessibility across 100M+ developers. Our team was brought in to evaluate it before wider release.
            </Body>
            <Body style={{ marginTop: '14px' }}>
              What we found went far beyond usability scores. The new design, built to help people, was actively getting in their way.
            </Body>
            <CaseImg src="/work/github/context.png" alt="GitHub code review context" style={{ marginTop: '28px' }} />
          </section>

          <div ref={contextSentinelRef} />

          {/* Team / Role / Timeline */}
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', paddingTop: '36px', paddingBottom: '52px' }}>
            {[
              { label: 'Role',     value: 'Product Designer · User Researcher' },
              { label: 'Team',     value: '3 Designers · 1 Sr. Researcher · 1 PM' },
              { label: 'Timeline', value: 'Jan – Mar 2024 · Microsoft / GitHub' },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontFamily: MONO, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, marginBottom: '4px' }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: MONO, fontSize: '11px', color: MUTED }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* ── Impact ──────────────────────────────────────────── */}
          <section id="impact" style={{ paddingTop: '52px' }}>
            <Label>Impact</Label>
            <SectionHead>Small interactions carry enormous weight at scale.</SectionHead>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {[
                { value: '60%', label: 'less mouse movement' },
                { value: '40%', label: 'faster file navigation' },
                { value: '3s',  label: 'saved per comment interaction' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, minWidth: '120px', padding: '20px 22px',
                  background: 'rgba(28,27,25,0.04)', borderRadius: '6px',
                }}>
                  <p style={{ fontFamily: AVERIA, fontSize: '36px', fontWeight: 400, color: INK, lineHeight: 1, marginBottom: '6px' }}>{s.value}</p>
                  <p style={{ fontFamily: MONO, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: FAINT }}>{s.label}</p>
                </div>
              ))}
            </div>

            <CaseImg src="/work/github/scaleofimpact.avif" alt="Scale of impact" style={{ marginBottom: '16px' }} />
            <CaseImg src="/work/github/impact.png" alt="Impact summary" style={{ marginBottom: '36px' }} />

            <Body style={{ marginBottom: '14px' }}>
              Our recommendations directly influenced GitHub's development roadmap. The four design changes shipped reduced friction for millions of developers on every code review — every day.
            </Body>
            <Body>
              Understanding physical workspaces surfaced insights invisible in analytics. Multiple monitors weren't a preference — they were fundamental to how developers actually work.
            </Body>

            <Pullquote>
              {`"Accessible" isn't always accessible. Making something truly accessible means understanding all users' actual workflows — not just following guidelines.`}
            </Pullquote>
          </section>

          {/* ── Solution ────────────────────────────────────────── */}
          <section id="solution" style={{ paddingTop: '72px' }}>
            <Label>Solution</Label>
            <SectionHead>Four targeted changes. Each came directly from observed behaviour.</SectionHead>

            <Finding
              number="01"
              headline="Make the full code line interactive — not just a right-side icon"
              quote={`"I have to move my mouse quite a lot further for a comment, because generally I\u2019m reading on the left side. Code is never right justified."`}
              body="4 out of 6 developers use multiple monitors. Right-aligned floating comments forced constant screen scanning and excessive mouse travel. Making the entire code line interactive reduced mouse movement by 60% and review completion time by 25%."
              imageSrc="/work/github/dual-monitor.png"
              imageAlt="Dual monitor setup insight"
              solutionSrc="/work/github/solution1.png"
              solutionAlt="Solution: full-line interactive comments"
            />

            <Finding
              number="02"
              headline="Let users choose between floating and inline comment modes"
              quote='"Having to expand and collapse the comments is tedious, especially if there are many comments I need to check or revisit."'
              body="Long discussions broke flow when floating. The one-size-fits-all approach failed most users. A toggle in settings — floating vs inline — gave users the control they needed, improving handling of long discussions without sacrificing accessibility defaults."
              solutionSrc="/work/github/solution2.png"
              solutionAlt="Solution: comment mode toggle in settings"
            />

            <Finding
              number="03"
              headline="Fix contrast on highlighted code lines — for everyone"
              quote='"The green logo on the green line would be hard for people to distinguish."'
              body="Color-blind users particularly struggled with comment indicators on highlighted code lines. Enhanced contrast ratios and clear visual distinction improved visibility for all users — achieving true universal accessibility rather than accessibility theatre."
              imageSrc="/work/github/solution-context-3.avif"
              imageAlt="Visibility problem context"
              solutionSrc="/work/github/solution3.png"
              solutionAlt="Solution: enhanced contrast and visual indicators"
            />

            <Finding
              number="04"
              headline="Show comment distribution in the file tree"
              quote={`"I have to scroll a lot to see which file has comments, especially when there\u2019s a lot of files."`}
              body="With no visibility of comment distribution across files, developers manually hunted for discussions — repeatedly breaking focus. Comment counts in the file tree cut navigation time by 40% and gave reviewers complete context at a glance."
              solutionSrc="/work/github/solution4.png"
              solutionAlt="Solution: comment counts in file tree"
            />
          </section>

          {/* ── Process ─────────────────────────────────────────── */}
          <section id="process" style={{ paddingTop: '72px' }}>
            <Label>Process</Label>
            <SectionHead>The problem was not what anyone expected.</SectionHead>

            <Body style={{ marginBottom: '14px' }}>
              GitHub had spent years making their platform more accessible. But when we tested the redesigned pull request experience, it scored significantly lower on usability.
            </Body>
            <Body style={{ marginBottom: '36px' }}>
              Shipping it would degrade the daily workflow of millions of developers.
            </Body>

            {/* SUS callout — tinted background, no border */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '28px 32px', marginBottom: '32px',
              background: 'rgba(200,75,47,0.05)', borderRadius: '8px',
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontFamily: AVERIA, fontSize: '44px', fontWeight: 400, color: ACCENT, lineHeight: 1 }}>66.75</p>
                <p style={{ fontFamily: MONO, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: FAINT, marginTop: '6px' }}>New UI SUS Score</p>
              </div>
              <div style={{ fontFamily: MONO, fontSize: '16px', color: FAINT }}>vs</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontFamily: AVERIA, fontSize: '44px', fontWeight: 400, color: INK, lineHeight: 1 }}>75.5</p>
                <p style={{ fontFamily: MONO, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: FAINT, marginTop: '6px' }}>Original UI SUS Score</p>
              </div>
            </div>

            <CaseImg src="/work/github/accessibility-paradox.avif" alt="The accessibility paradox" style={{ marginBottom: '12px' }} />
            <CaseImg src="/work/github/current-state-reseach-synth.png" alt="Current state research synthesis" />

            {/* Research */}
            <div style={{ paddingTop: '56px' }}>
              <Label>Research</Label>
              <SectionHead>Building a complete picture of how developers actually work.</SectionHead>
              <Body style={{ marginBottom: '14px' }}>
                Six experienced developers across four testing environments — two UIs × two roles (Code Author / Code Reviewer). Order randomized to mitigate bias.
              </Body>
              <Body>
                This surfaced realities invisible in analytics: multiple monitor setups, async collaboration across time zones, comments ranging from one-liners to long threaded discussions, and widely varying accessibility needs.
              </Body>

              <Pullquote>We weren't measuring speed. We were measuring understanding.</Pullquote>

              <CaseImg src="/work/github/research-methods.png" alt="Research methods" style={{ marginBottom: '12px' }} />
              <CaseImg src="/work/github/scenariostasks.png" alt="Scenarios and tasks" style={{ marginBottom: '12px' }} />
              <CaseImg src="/work/github/current-developer-state-metric.avif" alt="Developer state metrics" />

              <Body style={{ marginTop: '20px' }}>
                Sentiment was the signal. Developers didn't just score the new UI lower — they expressed frustration, confusion, and a longing for the original.
              </Body>
              <CaseImg src="/work/github/sad-overwhelmed-face.png" alt="User sentiment" style={{ marginTop: '16px' }} />
            </div>

            {/* Design exploration */}
            <div style={{ paddingTop: '56px' }}>
              <Label>Design Exploration</Label>
              <SectionHead>Three gaps: Connection, Context, Control.</SectionHead>
              <Body style={{ marginBottom: '24px' }}>
                Research revealed where the new design broke down. Developers lost the thread of conversations across files (Connection), hidden comments disrupted train of thought (Context), and floating comments reduced control for most users (Control).
              </Body>

              <CaseImg src="/work/github/problem-framing.avif" alt="Problem framing" style={{ marginBottom: '12px' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <CaseImg src="/work/github/visual-exporation-1.png" alt="Visual exploration 1" />
                <CaseImg src="/work/github/visual-exploration-2.png" alt="Visual exploration 2" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <CaseImg src="/work/github/visual-exploration-3.png" alt="Visual exploration 3" />
                <CaseImg src="/work/github/visual-exploration4.avif" alt="Visual exploration 4" />
              </div>
            </div>
          </section>

          {/* ── Next project ─────────────────────────────────────── */}
          <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => router.push('/work/ai-email-assistant')}
              style={{
                fontFamily: MONO, fontSize: '10px', letterSpacing: '0.08em',
                color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span>Next: AI Email Assistant</span>
              <span>→</span>
            </button>
          </div>

        </motion.div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        ref={footerRef}
        style={{
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: BG,
          opacity: footerVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="3" cy="3" r="3" fill={ACCENT} />
          </svg>
          <span style={{
            fontFamily: MONO, fontSize: '11px', fontStyle: 'italic',
            color: FAINT, letterSpacing: '0.03em', whiteSpace: 'nowrap',
          }}>
            {footerMsg}
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: '10px', color: FAINT, whiteSpace: 'nowrap' }}>
          Designed &amp; developed by Harshita · © 2025
        </span>
      </footer>

    </div>
  )
}
