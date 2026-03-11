'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type HoverState } from '@/components/HoverImages'
function BackArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3L5 7L9 11" stroke="var(--ink-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function PlusIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.22 }}
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <line x1="5" y1="1" x2="5" y2="9" stroke="var(--ink-faint)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="1" y1="5" x2="9" y2="5" stroke="var(--ink-faint)" strokeWidth="1.3" strokeLinecap="round" />
    </motion.svg>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Metric { value: string; label: string }
interface ProjectData {
  title: string; type: string; role: string; description: string
  details: { problem: string; contribution: string; decisions: string; metrics: Metric[] }
  furtherReading: string[]
  shortDesc: string; route: string; cta: string
}

// ── Project data ───────────────────────────────────────────────────────────
const PROJECT_INFO: Record<string, ProjectData> = {
  influence: {
    title: 'Influence Graph',
    type: 'PRODUCT DESIGN · SALESLOFT · 2024',
    role: 'Lead Product Designer',
    description: 'AI-powered relationship intelligence for enterprise sales. Surfaces hidden connection paths between sellers and buyers across an entire organisation.',
    details: {
      problem: 'Enterprise sellers couldn\'t see or navigate buying group relationships. Critical stakeholder paths were invisible, leading to missed deals and stalled pipeline.',
      contribution: 'End-to-end design from research through launch. Defined information architecture, designed the relationship graph system, and led alignment across product, engineering, and GTM.',
      decisions: 'Chose graph visualisation over list-based UI to make network topology legible. Prioritised progressive disclosure to avoid overwhelming users with full complexity.',
      metrics: [
        { value: '—', label: 'Metric placeholder' },
        { value: '—', label: 'Metric placeholder' },
      ],
    },
    furtherReading: [
      'The hardest part wasn\'t building the graph — it was deciding what to leave out. Enterprise data is dense. Showing everything would have been useless.',
      'Six rounds of usability tests before converging on the layout. The key insight: sellers don\'t think in networks, they think in paths.',
    ],
    shortDesc: 'AI-powered relationship intelligence for enterprise sales',
    route: '/work/influence-graph', cta: 'View case study →',
  },
  ai_email: {
    title: 'AI Email Assistant',
    type: 'PRODUCT DESIGN · SALESLOFT · 2023',
    role: 'Lead Product Designer',
    description: 'Generative email with built-in explainability. Reps build intuition instead of just clicking accept.',
    details: {
      problem: 'Generative AI email existed but reps couldn\'t tell why suggestions were made — leading to blind acceptance, low trust, and degraded personalisation over time.',
      contribution: 'Designed the explainability layer: surfacing signals behind each generated suggestion in real-time, so reps could learn and edit with confidence.',
      decisions: 'Rejected the "magic black box" pattern in favour of transparent reasoning. Built micro-annotations that explain each sentence without cluttering the compose view.',
      metrics: [
        { value: '—', label: 'Metric placeholder' },
        { value: '—', label: 'Metric placeholder' },
      ],
    },
    furtherReading: [
      'Explainability is not the same as complexity. The challenge was making reasoning legible in under 3 seconds — which forced radical simplification of how we described AI decisions.',
      'We prototyped 12 different annotation patterns. The one that shipped was the fourth we tried — the others added cognitive load rather than reducing it.',
    ],
    shortDesc: 'Generative email with built-in explainability',
    route: '/work/ai-email-assistant', cta: 'View case study →',
  },
  github: {
    title: 'GitHub Pull Requests',
    type: 'UX RESEARCH · GITHUB · 2024',
    role: 'Graduate Product Designer',
    description: 'Code review UX research across 50M+ developers. Uncovered an accessibility paradox that would have shipped to production.',
    details: {
      problem: 'A proposed PR interface change would have improved efficiency for most developers while silently breaking the workflow for developers with visual impairments — a trade-off invisible to the team.',
      contribution: 'Designed and ran mixed-methods research across GitHub\'s developer base. Synthesised findings into actionable design recommendations that prevented the problematic change from shipping.',
      decisions: 'Chose to frame the finding as a systemic design pattern problem, not a one-off edge case — which led to broader accessibility audit protocols being adopted.',
      metrics: [
        { value: '50M+', label: 'Developers impacted' },
        { value: '25%', label: 'Faster review cycles' },
      ],
    },
    furtherReading: [
      'The accessibility paradox: the change that helped 99% of users would have been invisible and confusing to 1% — and that 1% had no alternative path.',
      'This project changed how I think about research scope. A small usability study became a systems-level finding once we followed the data far enough.',
    ],
    shortDesc: 'Code review UX research across 50M+ developers',
    route: '/work/github', cta: 'View case study →',
  },
  sony: {
    title: 'Sony Audio',
    type: 'PRODUCT DESIGN · SONY · 2023',
    role: 'UX Designer',
    description: 'Hardware-software interaction design for audio onboarding. Bridging physical product and digital experience.',
    details: {
      problem: 'Sony\'s premium headphone onboarding failed to connect the physical unboxing moment to the digital setup experience — users arrived in the app already frustrated.',
      contribution: 'Consumer research and interaction design for the setup flow. Mapped the full journey from box opening to first successful playback and redesigned the critical drop-off points.',
      decisions: 'Reframed onboarding as a product story rather than a setup checklist — leading with delight before asking for permissions.',
      metrics: [
        { value: '—', label: 'Metric placeholder' },
        { value: '—', label: 'Metric placeholder' },
      ],
    },
    furtherReading: [
      'Physical products have a moment of anticipation that digital products rarely match. The unboxing is an emotional peak — and the onboarding was squandering it with bluetooth pairing instructions.',
      'The most useful research came from sitting with people as they opened the box for the first time. Nothing in a survey would have captured that specific moment of confusion.',
    ],
    shortDesc: 'Hardware-software interaction for audio onboarding',
    route: '/work/sony', cta: 'View deck →',
  },
}

// ── Experience ─────────────────────────────────────────────────────────────
const EXPERIENCE = [
  { role: 'Product Designer',                         company: 'Salesloft',                   period: '2025–present' },
  { role: 'Graduate Product Designer',                company: 'GitHub',                      period: '2024'         },
  { role: 'M.S. Human Centered Design & Engineering', company: 'University of Washington',    period: '2023–2025'    },
  { role: 'Software Designer → UX Designer',          company: 'Hewlett Packard Enterprise',  period: '2021–2023'    },
  { role: 'UX Developer Intern',                      company: 'Nutanix',                     period: '2021'         },
]

// ── Primitives ─────────────────────────────────────────────────────────────
const HR = () => (
  <div style={{ padding: '0 14px' }}>
    <div style={{ borderBottom: '1px dotted var(--border)' }} />
  </div>
)

function AccordionRow({ label, open, onToggle, children, onSectionHover, onSectionHoverEnd, noBottomDivider }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
  onSectionHover?: () => void; onSectionHoverEnd?: () => void
  noBottomDivider?: boolean
}) {
  return (
    <div onMouseEnter={onSectionHover} onMouseLeave={onSectionHoverEnd}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '10px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px',
          letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink)',
        }}>
          {label}
        </span>
        <PlusIcon open={open} />
      </button>
      {!noBottomDivider && <HR />}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 360ms cubic-bezier(0.25,0,0.25,1)',
        overflow: 'hidden',
      }}>
        <div style={{ minHeight: 0 }}>
          <div style={{
            opacity: open ? 1 : 0,
            transition: `opacity ${open ? '220ms' : '120ms'} ease ${open ? '140ms' : '0ms'}`,
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── RightPanel ─────────────────────────────────────────────────────────────
export interface RightPanelProps {
  onHoverChange?: (s: HoverState) => void
  onProjectExpand?: (id: string | null) => void
  onNavigate?: (route: string, projectId: string) => void
}

export default function RightPanel({ onHoverChange, onProjectExpand, onNavigate }: RightPanelProps) {
  const [expanded, setExpanded]           = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [blurbVisible, setBlurbVisible]   = useState(true)
  const [detailsOpen, setDetailsOpen]     = useState(false)
  const [ctaHov, setCtaHov]               = useState(false)

  // Collapse entire bio when any accordion is open to save vertical space
  useEffect(() => {
    if (openAccordion !== null) {
      setBlurbVisible(false)
    } else {
      const t = setTimeout(() => setBlurbVisible(true), 200)
      return () => clearTimeout(t)
    }
  }, [openAccordion])

  function handleExpand(id: string) {
    setExpanded(id)
    setDetailsOpen(false)
    onProjectExpand?.(id)
  }

  function handleCollapse() {
    setExpanded(null)
    onProjectExpand?.(null)
  }

  const proj = expanded ? PROJECT_INFO[expanded] : null

  function dispatchSection(section: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sv:section', { detail: { section } }))
    }
  }

  const cardStyle = {
    background: 'var(--panel-bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  } as const

  // Shared INDEX header row content
  const indexHeader = (showBack: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <circle cx="3" cy="3" r="3" fill="var(--accent)" />
        </svg>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
          Index
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showBack && (
          <button
            onClick={handleCollapse}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            aria-label="Back to index"
          >
            <BackArrowIcon />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div
      className="hidden md:flex"
      style={{
        position: 'fixed',
        right: 'calc(50% - 450px)',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '296px',
        maxHeight: 'calc(100vh - 48px)',
        zIndex: 15,
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── STATE 1: DEFAULT — single unified card ──────────── */}
        {!expanded && (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            style={{ ...cardStyle, overflowY: 'auto', maxHeight: 'calc(100vh - 48px)' }}
          >
            {/* INDEX header */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 0.525 }}
            >
              {indexHeader(false)}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 0.6 }}
            >
              <HR />
            </motion.div>

            {/* Bio — collapses entirely when any accordion opens */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 0.85 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateRows: blurbVisible ? '1fr' : '0fr',
                transition: `grid-template-rows 360ms cubic-bezier(0.25,0,0.25,1)`,
                overflow: 'hidden',
              }}>
                <div style={{ minHeight: 0 }}>
                  <div style={{
                    opacity: blurbVisible ? 1 : 0,
                    transition: `opacity ${blurbVisible ? '200ms' : '100ms'} ease ${blurbVisible ? '160ms' : '0ms'}`,
                  }}>
                    <div style={{ padding: '12px 16px 10px' }}>
                      <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.8 }}>
                        Harshita is a Product designer, researcher. Her work lies at the intersection of careful observation and AI systems.
                      </p>
                      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px', color: 'var(--ink-faint)', lineHeight: 1.6, letterSpacing: '0.02em', marginTop: '8px' }}>
                        Currently: Product Designer at Salesloft
                      </p>
                    </div>
                    <HR />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* WORK */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 1.175 }}
            >
              <AccordionRow
                label="Work" open={openAccordion === 'work'}
                onToggle={() => setOpenAccordion(o => { const next = o === 'work' ? null : 'work'; if (next) dispatchSection(next); return next })}
                onSectionHover={() => onHoverChange?.({ type: 'work' })}
                onSectionHoverEnd={() => onHoverChange?.(null)}
              >
                <div style={{ padding: '4px 0 10px' }}>
                  {Object.entries(PROJECT_INFO).map(([id, p]) => (
                    <button
                      key={id}
                      onClick={() => handleExpand(id)}
                      onMouseEnter={() => onHoverChange?.({ type: 'project', id })}
                      onMouseLeave={() => onHoverChange?.({ type: 'work' })}
                      style={{ display: 'block', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 16px 6px', textAlign: 'left' }}
                    >
                      <span style={{ display: 'block', fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11.5px', color: 'var(--ink-muted)', transition: 'color 0.15s ease', marginBottom: '2px' }}>
                        {p.title}
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px', color: 'var(--ink-faint)', letterSpacing: '0.02em', lineHeight: 1.5 }}>
                        {p.shortDesc}
                      </span>
                    </button>
                  ))}
                </div>
              </AccordionRow>
            </motion.div>

            {/* EXPERIENCE */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 1.5 }}
            >
              <AccordionRow
                label="Experience" open={openAccordion === 'experience'}
                onToggle={() => setOpenAccordion(o => o === 'experience' ? null : 'experience')}
              >
                <div style={{ padding: '4px 0 10px' }}>
                  {EXPERIENCE.map((item, i) => (
                    <div key={i} style={{ padding: '6px 16px 5px' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                        {item.role}
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px', color: 'var(--ink-faint)', letterSpacing: '0.02em', lineHeight: 1.5 }}>
                        {item.company} · {item.period}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionRow>
            </motion.div>

            {/* EXPLORATIONS */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 1.825 }}
            >
              <AccordionRow
                label="Explorations" open={openAccordion === 'explorations'}
                onToggle={() => setOpenAccordion(o => { const next = o === 'explorations' ? null : 'explorations'; if (next) dispatchSection(next); return next })}
                onSectionHover={() => onHoverChange?.({ type: 'explorations' })}
                onSectionHoverEnd={() => onHoverChange?.(null)}
              >
                <div style={{ padding: '10px 16px 14px' }}>
                  <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.75 }}>
                    Side projects, experiments, visual notes and things built for curiosity.
                  </p>
                </div>
              </AccordionRow>
            </motion.div>

            {/* ABOUT */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 2.15 }}
            >
              <AccordionRow
                label="About" open={openAccordion === 'about'}
                onToggle={() => setOpenAccordion(o => { const next = o === 'about' ? null : 'about'; if (next) dispatchSection(next); return next })}
                onSectionHover={() => onHoverChange?.({ type: 'about' })}
                onSectionHoverEnd={() => onHoverChange?.(null)}
              >
                <div style={{ padding: '10px 16px 14px' }}>
                  <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.8 }}>
                    [ABOUT_TEXT]
                  </p>
                </div>
              </AccordionRow>
            </motion.div>

            {/* CONTACT */}
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0, 0, 1], delay: 2.475 }}
            >
              <AccordionRow
                label="Contact" open={openAccordion === 'contact'}
                onToggle={() => setOpenAccordion(o => o === 'contact' ? null : 'contact')}
                noBottomDivider
              >
                <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a href="mailto:hello@harshitashyale.com" style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
                    hello@harshitashyale.com
                  </a>
                  <a href="https://linkedin.com/in/harshitashyale" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
                    linkedin.com/in/harshitashyale
                  </a>
                </div>
              </AccordionRow>
            </motion.div>

            <div style={{ height: '4px' }} />
          </motion.div>
        )}

          {/* ── STATE 3: EXPANDED — INDEX strip + content card ── */}
          {expanded && proj && (
            <motion.div
              key={`proj-${expanded}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {/* INDEX strip — collapsed header */}
              <div style={{ ...cardStyle }}>
                {indexHeader(true)}
              </div>

              {/* Project content card */}
              <div style={{ ...cardStyle, overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>

                {/* Section header: ■ WORK  × — matching Trousdale reference */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect width="7" height="7" fill="var(--ink-faint)" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                      Work
                    </span>
                  </div>
                  <button
                    onClick={handleCollapse}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12px', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <HR />

                {/* Title block */}
                <div style={{ padding: '14px 16px 14px' }}>
                  <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '16px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '6px' }}>
                    {proj.title}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: '2px' }}>
                    {proj.type}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '8.5px', letterSpacing: '0.05em', color: 'var(--ink-faint)', marginBottom: '12px' }}>
                    {proj.role}
                  </p>
                  <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.8 }}>
                    {proj.description}
                  </p>
                </div>

                {/* DETAILS */}
                <HR />
                <AccordionRow label="Details" open={detailsOpen} onToggle={() => setDetailsOpen(o => !o)}>
                  <div style={{ padding: '12px 16px 16px' }}>
                    {[
                      { heading: 'Problem',       body: proj.details.problem      },
                      { heading: 'Contribution',  body: proj.details.contribution },
                      { heading: 'Key decisions', body: proj.details.decisions    },
                    ].map(({ heading, body }) => (
                      <div key={heading} style={{ marginBottom: '12px' }}>
                        <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: '4px' }}>
                          {heading}
                        </p>
                        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11.5px', color: 'var(--ink-muted)', lineHeight: 1.75 }}>
                          {body}
                        </p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                      {proj.details.metrics.map((m, i) => (
                        <div key={i}>
                          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '20px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>{m.value}</p>
                          <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '8.5px', color: 'var(--ink-faint)', marginTop: '3px', letterSpacing: '0.04em' }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionRow>

                {/* CTA */}
                <HR />
                <div style={{ padding: '12px 16px 16px' }}>
                  <button
                    onClick={() => onNavigate?.(proj.route, expanded)}
                    onMouseEnter={() => setCtaHov(true)}
                    onMouseLeave={() => setCtaHov(false)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', letterSpacing: '0.1em',
                      color: ctaHov ? 'var(--accent)' : 'var(--ink-muted)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {proj.cta}
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
    </div>
  )
}
