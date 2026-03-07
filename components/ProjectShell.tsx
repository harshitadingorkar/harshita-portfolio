'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import PasswordGate from '@/components/PasswordGate'

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

export interface Stat    { value: string; label: string }
export interface Section { label: string; body: string }

export interface ProjectShellProps {
  title: string
  subtitle: string
  company: string
  year: string
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
      {/* Full-width media — replace the inner div with <video> or <img> */}
      <div
        className="stripe-pattern"
        style={{
          width: '100%',
          aspectRatio: '21/9',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ↓ Replace with <video autoPlay muted loop playsInline src="..."> or <img src="..." /> */}
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: '10px',
          color: 'var(--ink-faint)',
          letterSpacing: '0.08em',
        }}>
          [ {section.label} — image / video ]
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '40px',
        padding: '44px 60px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: '9.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.13em',
          color: 'var(--ink-faint)',
          paddingTop: '2px',
        }}>
          {section.label}
        </div>
        <p style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: '13px',
          color: 'var(--ink-muted)',
          lineHeight: 1.85,
          maxWidth: '600px',
        }}>
          {section.body}
        </p>
      </div>
    </motion.div>
  )
}

// ── Sticky collapsed mini-panel (right side of project page) ──────────────
function MiniPanel({ title, subtitle, company, year }: {
  title: string; subtitle: string; company: string; year: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '240px',
        zIndex: 40,
        background: 'color-mix(in srgb, var(--bg) 94%, transparent)',
        backdropFilter: 'blur(8px)',
        borderLeft: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '18px 20px',
        opacity: scrolled ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
        <span style={{ color: 'var(--accent)', fontSize: '11px' }}>●</span>
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--ink-faint)',
        }}>
          {company} · {year}
        </span>
      </div>
      <p style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '15px',
        fontWeight: 400,
        color: 'var(--ink)',
        lineHeight: 1.2,
        marginBottom: '10px',
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: 'var(--font-ibm-plex-mono)',
        fontSize: '10.5px',
        color: 'var(--ink-muted)',
        lineHeight: 1.65,
        fontStyle: 'italic',
      }}>
        {subtitle}
      </p>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export default function ProjectShell({
  title, subtitle, company, year,
  stats, impactStatement, sections, passwordProtected,
}: ProjectShellProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const content = (
    <>
      {sections.map((s, i) => <SectionBlock key={i} section={s} i={i} />)}
    </>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>

      {/* ── Breadcrumb top bar ────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ color: 'var(--accent)', fontSize: '12px' }}>●</span>
          <button
            onClick={() => router.push('/')}
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '10.5px',
              color: 'var(--ink-muted)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            Harshita Shyale
          </button>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10.5px', color: 'var(--ink-faint)' }}>›</span>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10.5px', color: 'var(--ink)' }}>{title}</span>
        </div>

        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex' }}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* ── Sticky mini panel (collapsed right side) ─────────────── */}
      <MiniPanel title={title} subtitle={subtitle} company={company} year={year} />

      {/* ── Hero: two-column ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '42% 58%',
          minHeight: '78vh',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Left */}
        <div style={{
          padding: '64px 44px 64px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border)',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '9.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.13em',
              color: 'var(--ink-faint)',
              marginBottom: '20px',
            }}>
              {company} · {year}
            </p>

            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(30px, 4vw, 48px)',
              fontWeight: 400,
              color: 'var(--ink)',
              lineHeight: 1.1,
              marginBottom: '22px',
            }}>
              {title}
            </h1>

            <p style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '12.5px',
              color: 'var(--ink-muted)',
              lineHeight: 1.7,
              maxWidth: '340px',
            }}>
              {subtitle}
            </p>
          </div>

          {stats && stats.length > 0 && (
            <div>
              <p style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-faint)',
                marginBottom: '12px',
              }}>
                Impact:
              </p>
              <div style={{ display: 'flex', gap: '28px', marginBottom: '14px' }}>
                {stats.map(stat => (
                  <div key={stat.label}>
                    <p style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 'clamp(26px, 3vw, 38px)',
                      fontWeight: 400,
                      color: 'var(--ink)',
                      lineHeight: 1,
                      marginBottom: '4px',
                    }}>
                      {stat.value}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '9.5px', color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              {impactStatement && (
                <p style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '11.5px',
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  maxWidth: '300px',
                }}>
                  {impactStatement}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: hero media — replace with <img> or <video> */}
        <div
          className="stripe-pattern"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* ↓ Replace this div with <img src="..." style={{width:'100%',height:'100%',objectFit:'cover'}} />
               or <video autoPlay muted loop playsInline style={{width:'100%',height:'100%',objectFit:'cover'}} /> */}
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
            Hero image / video
          </span>
        </div>
      </motion.div>

      {/* ── Case study body ───────────────────────────────────────── */}
      {passwordProtected ? <PasswordGate>{content}</PasswordGate> : content}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 60px',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
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
