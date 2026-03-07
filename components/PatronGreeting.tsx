'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOrCreatePatron, hasVisitedBefore, getLastVisit } from '@/lib/patronus'

function greetingMessage(name: string, msSinceLast: number | null): string {
  if (msSinceLast === null) return ''
  const h = msSinceLast / 3600000
  const d = msSinceLast / 86400000
  if (h < 1)   return `back so soon, ${name}?`
  if (h < 24)  return `twice in one day, ${name}.`
  if (d < 7)   return `oh, it's you again, ${name}.`
  if (d < 31)  return `you came back, ${name}. good.`
  if (d < 91)  return `${name}. it's been a while.`
  return `we thought you'd forgotten us, ${name}.`
}

export default function PatronGreeting() {
  const [greeting, setGreeting] = useState('')
  const [name, setName]         = useState('')
  const [visible, setVisible]   = useState(false)
  const [hovered, setHovered]   = useState(false)

  useEffect(() => {
    if (!hasVisitedBefore()) return   // first visit: canvas handles text

    const patron   = getOrCreatePatron()
    const lastVisit = getLastVisit()
    const msg = greetingMessage(patron.name, lastVisit ? Date.now() - lastVisit : null)

    setName(patron.name)
    setGreeting(msg)

    const show = setTimeout(() => setVisible(true), 800)
    const hide = setTimeout(() => setVisible(false), 6800)   // 800 delay + 5s display + 1s fade
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  if (!name) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '52px',
        left: '52px',
        zIndex: 20,
        pointerEvents: 'auto',
      }}
    >
      {/* Transient greeting */}
      <AnimatePresence>
        {visible && greeting && (
          <motion.p
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '11px',
              color: 'var(--ink)',
              letterSpacing: '0.02em',
              marginBottom: '4px',
            }}
          >
            {greeting}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Persistent name anchor */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 0.65 : 0.3 }}
        transition={{ duration: 0.4, delay: 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: '10px',
          color: 'var(--ink-faint)',
          letterSpacing: '0.06em',
          cursor: 'default',
          transition: 'opacity 0.2s ease',
          display: 'block',
        }}
      >
        {name} ·
      </motion.span>
    </div>
  )
}
