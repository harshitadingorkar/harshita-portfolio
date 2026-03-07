'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

// ── Project info ───────────────────────────────────────────────────────────
const PROJECT_MAP: Record<string, {
  title: string; company: string; year: string
  description: string; tags: string[]; route: string
  passwordProtected?: boolean
}> = {
  influence: {
    title: 'Influence Graph',
    company: 'Salesloft', year: '2024',
    description: 'A 0→1 AI-powered relationship intelligence tool. Visualizing stakeholder networks and surfacing influence pathways within enterprise accounts.',
    tags: ['AI/ML', 'Data Viz', 'B2B SaaS', '0→1'],
    route: '/work/influence-graph',
    passwordProtected: true,
  },
  ai_email: {
    title: 'AI Email Assistant',
    company: 'Salesloft', year: '2023',
    description: 'Generative AI email composition with built-in explainability — helping reps trust and edit AI suggestions while maintaining their voice.',
    tags: ['Generative AI', 'Explainability', 'Productivity'],
    route: '/work/ai-email-assistant',
    passwordProtected: true,
  },
  github: {
    title: 'GitHub Pull Requests',
    company: 'Microsoft / GitHub', year: '2022',
    description: 'Developer UX research and systems design across core pull request workflows and CI/CD status visibility for 50M+ active users.',
    tags: ['Developer Tools', 'UX Research', 'Systems'],
    route: '/work/github',
  },
  sony: {
    title: 'Sony Audio',
    company: 'Sony', year: '2021',
    description: 'Consumer research and hardware-software interaction design for Sony\'s next-generation audio product line.',
    tags: ['Consumer', 'Research', 'Hardware/Software'],
    route: '/work/sony',
  },
}

const WORK_ORDER = ['influence', 'ai_email', 'github', 'sony']

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

const HR = <div style={{ borderBottom: '1px dashed var(--border)' }} />

interface Props {
  section: 'hero' | 'work'
  hoveredProjectId: string | null
}

export default function IndexPanel({ section, hoveredProjectId }: Props) {
  const { resolvedTheme, setTheme } = useTheme()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'index' | 'project'>('index')

  // Auto-switch to project tab when hovering
  useEffect(() => {
    if (hoveredProjectId) setActiveTab('project')
  }, [hoveredProjectId])

  const activeProject = hoveredProjectId ? PROJECT_MAP[hoveredProjectId] : null
  const inWorkSection = section === 'work'

  const SECTIONS = [
    {
      id: 'work', symbol: '■', label: 'Work',
      content: (
        <div style={{ paddingBottom: '4px' }}>
          {WORK_ORDER.map(id => {
            const p = PROJECT_MAP[id]
            return (
              <a
                key={id}
                href={p.route}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 20px',
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '11px',
                  color: hoveredProjectId === id ? 'var(--ink)' : 'var(--ink-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
              >
                <span>{p.title}</span>
                <span style={{ fontSize: '9.5px', color: 'var(--ink-faint)' }}>{p.year}</span>
              </a>
            )
          })}
        </div>
      ),
    },
    {
      id: 'about', symbol: '▲', label: 'About',
      content: (
        <div style={{ padding: '12px 20px 14px', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11.5px', color: 'var(--ink-muted)', lineHeight: 1.75 }}>
          {/* ↓ Replace with copy from harshitashyale.com/about */}
          <p style={{ marginBottom: '8px' }}>Product Designer at Salesloft, specializing in AI interfaces and human-centered systems.</p>
          <p style={{ marginBottom: '4px' }}>M.S. Computer Science · UW · 2022</p>
          <p>B.E. Computer Science · 2020</p>
        </div>
      ),
    },
    {
      id: 'contact', symbol: '●', label: 'Contact',
      content: (
        <div style={{ padding: '12px 20px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {[
            { label: 'Email',    href: 'mailto:hello@harshitashyale.com', text: 'hello@harshitashyale.com' },
            { label: 'LinkedIn', href: '#',                               text: 'linkedin.com/in/harshitashyale' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
              {l.text}
            </a>
          ))}
        </div>
      ),
    },
    {
      id: 'resume', symbol: '●', label: 'Resume',
      content: (
        <div style={{ padding: '12px 20px 14px' }}>
          <a href="#" style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
            Download PDF →
          </a>
        </div>
      ),
    },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{
        padding: '17px 20px 13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Orange dot */}
          <span style={{ color: 'var(--accent)', fontSize: '12px', lineHeight: 1 }}>●</span>

          {/* INDEX tab — always visible */}
          <button
            onClick={() => setActiveTab('index')}
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: activeTab === 'index' ? 'var(--ink)' : 'var(--ink-faint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s ease',
            }}
          >
            Index
          </button>

          {/* PROJECT tab — only in work section */}
          <AnimatePresence>
            {inWorkSection && (
              <motion.button
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveTab('project')}
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: activeTab === 'project' ? 'var(--ink)' : 'var(--ink-faint)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.15s ease',
                }}
              >
                Project
              </motion.button>
            )}
          </AnimatePresence>

          {/* TLDR tab — work section only */}
          <AnimatePresence>
            {inWorkSection && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                }}
              >
                TLDR
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex', padding: 0 }}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11px', color: 'var(--ink-faint)' }}>↑</span>
        </div>
      </div>

      {HR}

      {/* ── Body: index or project ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'index' || !activeProject ? (
          /* ── Bio ── */
          <motion.div
            key="bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ padding: '18px 20px 16px', flexShrink: 0 }}
          >
            {/* ↓ Replace with real bio from harshitashyale.com */}
            <p style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '12px',
              color: 'var(--ink-muted)',
              lineHeight: 1.82,
              textIndent: '1.3em',
            }}>
              I&apos;m Harshita — a product designer with a background in computer science
              and theatre, specializing in human-centered AI interfaces and systems —{' '}
              <a href="#about" style={{ color: 'var(--ink)', textUnderlineOffset: '2px', textDecoration: 'underline' }}>
                more information
              </a>.
            </p>
          </motion.div>
        ) : (
          /* ── Active project ── */
          <motion.div
            key={activeProject.route}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ flexShrink: 0 }}
          >
            {/* Image placeholder */}
            <div
              className="stripe-pattern"
              style={{ width: '100%', aspectRatio: '16/9' }}
            />

            <div style={{ padding: '16px 20px 18px' }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '19px',
                fontWeight: 400,
                color: 'var(--ink)',
                lineHeight: 1.2,
                marginBottom: '5px',
              }}>
                {activeProject.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '9.5px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: '12px',
              }}>
                {activeProject.company} · {activeProject.year}
              </p>
              <p style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '11.5px',
                color: 'var(--ink-muted)',
                lineHeight: 1.75,
                marginBottom: '14px',
              }}>
                {activeProject.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                {activeProject.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    padding: '3px 7px',
                    color: 'var(--ink-muted)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={activeProject.route}
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  textDecoration: 'none',
                }}
              >
                View Case Study →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {HR}

      {/* ── Expandable sections ─────────────────────────────────────── */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {SECTIONS.map(sec => (
          <div key={sec.id}>
            <button
              onClick={() => setOpenSection(s => s === sec.id ? null : sec.id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-muted)', lineHeight: 1 }}>
                  {sec.symbol}
                </span>
                <span style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '10.5px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                }}>
                  {sec.label}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '14px', color: 'var(--ink-faint)', lineHeight: 1 }}>
                {openSection === sec.id ? '−' : '+'}
              </span>
            </button>

            {HR}

            <AnimatePresence>
              {openSection === sec.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}
                >
                  {sec.content}
                  {HR}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
