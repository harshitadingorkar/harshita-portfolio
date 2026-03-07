'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const NAV_LINKS = [
  { label: 'Work',        href: '#work'  },
  { label: 'Odds & Ends', href: '#odds'  },
  { label: 'About',       href: '#about' },
  { label: 'Contact',     href: 'mailto:hello@harshitashyale.com' },
]

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function NavLink({ link, isActive }: { link: typeof NAV_LINKS[0]; isActive: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={link.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-ibm-plex-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        textDecoration: 'none',
        position: 'relative',
        paddingBottom: '2px',
      }}
    >
      {link.label}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          background: 'var(--ink)',
          width: isActive || hovered ? '100%' : '0%',
          transition: 'width 0.25s ease',
        }}
      />
    </a>
  )
}

export default function Sidebar() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const heroEl = document.getElementById('hero-canvas-section')
    if (!heroEl) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sections = ['work', 'odds', 'about']
    const observers: IntersectionObserver[] = []
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <nav
      aria-label="Main navigation"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.4s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
        }}
      />

      {/* Monogram */}
      <a
        href="/"
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-playfair)',
          fontSize: '15px',
          color: 'var(--ink)',
          textDecoration: 'none',
        }}
      >
        HS
      </a>

      {/* Links + toggle */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '32px' }}>
        {NAV_LINKS.map(link => {
          const sectionId = link.href.replace('#', '')
          return (
            <NavLink key={link.label} link={link} isActive={activeSection === sectionId} />
          )
        })}

        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
          style={{
            color: 'var(--ink-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}
