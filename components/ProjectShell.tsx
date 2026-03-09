'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PasswordGate from '@/components/PasswordGate'

// ── Collapsed INDEX strip — fixed top-right on case study pages ────────────
function IndexStrip({ title }: { title: string }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        right: '32px',
        top: '32px',
        zIndex: 50,
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        background: 'var(--panel-bg)',
        border: `1px solid ${hovered ? 'var(--ink)' : 'var(--border)'}`,
        borderRadius: '2px',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s ease',
        cursor: 'default',
      }}
    >
      <button
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--ink-muted)' }}
        aria-label="Go home"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 5.5L6 1.5L11 5.5V11H8V8H4V11H1V5.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      <div style={{ width: '1px', height: '14px', background: 'var(--border)', margin: '0 10px', flexShrink: 0 }} />

      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" style={{ flexShrink: 0, marginRight: '7px' }}>
        <circle cx="2.5" cy="2.5" r="2.5" fill="#c84b2f" />
      </svg>

      <span style={{
        fontFamily: 'var(--font-ibm-plex-mono)',
        fontSize: '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
    </motion.div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface Stat    { value: string; label: string }
export interface Section { label: string; body: string; imageSrc?: string }

export interface ProjectShellProps {
  title: string
  subtitle: string
  company: string
  year: string
  heroImage?: string
  stats?: Stat[]
  impactStatement?: string
  sections: Section[]
  passwordProtected?: boolean
}

function SectionBlock({ section, i }: { section: Section; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.04 * i }}
    >
      <div
        className={section.imageSrc ? undefined : 'stripe-pattern'}
        style={{
          width: '100%', aspectRatio: '21/9',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {section.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={section.imageSrc} alt={section.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
            [ {section.label} — image / video ]
          </span>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '40px',
        padding: '44px 60px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--ink-faint)', paddingTop: '2px' }}>
          {section.label}
        </div>
        <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.85, maxWidth: '600px' }}>
          {section.body}
        </p>
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────
export default function ProjectShell({
  title, subtitle, company, year, heroImage,
  stats, impactStatement, sections, passwordProtected,
}: ProjectShellProps) {

  const content = (
    <>
      {sections.map((s, i) => <SectionBlock key={i} section={s} i={i} />)}
    </>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>

      {/* ── Collapsed INDEX strip — fixed top-right ── */}
      <IndexStrip title={title} />

      {/* ── Hero: two-column ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'grid', gridTemplateColumns: '42% 58%',
          minHeight: '78vh', borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Left */}
        <div style={{
          padding: '64px 44px 64px 60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          borderRight: '1px solid var(--border)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--ink-faint)', marginBottom: '20px' }}>
              {company} · {year}
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '22px' }}>
              {title}
            </h1>
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: '340px' }}>
              {subtitle}
            </p>
          </div>

          {stats && stats.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-faint)', marginBottom: '12px' }}>
                Impact:
              </p>
              <div style={{ display: 'flex', gap: '28px', marginBottom: '14px' }}>
                {stats.map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>
                      {stat.value}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              {impactStatement && (
                <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '11.5px', color: 'var(--ink)', lineHeight: 1.6, maxWidth: '300px' }}>
                  {impactStatement}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: hero media */}
        <div
          className={heroImage ? undefined : 'stripe-pattern'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
              Hero image / video
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Case study body ───────────────────────────────────────── */}
      {passwordProtected ? <PasswordGate>{content}</PasswordGate> : content}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 60px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
          Designed &amp; developed by Harshita · © 2025
        </span>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
          harshitashyale.com
        </span>
      </footer>
    </div>
  )
}
