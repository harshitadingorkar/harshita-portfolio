'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PasswordGateProps {
  children: React.ReactNode
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [flash, setFlash] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const attempt = () => {
    if (value.toLowerCase() === 'salesloft') {
      setUnlocked(true)
      setError(false)
    } else {
      setFlash(true)
      setError(true)
      setValue('')
      setTimeout(() => setFlash(false), 300)
      inputRef.current?.focus()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center min-h-[60vh] px-6"
          style={{ gap: '24px' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontStyle: 'italic',
              color: 'var(--ink)',
              textAlign: 'center',
            }}
          >
            This case study is password protected.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '280px' }}>
            <input
              ref={inputRef}
              type="password"
              value={value}
              onChange={e => { setValue(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              placeholder="password"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '13px',
                background: 'transparent',
                border: `1px solid ${flash ? 'var(--accent)' : error ? 'var(--accent)' : 'var(--border)'}`,
                color: 'var(--ink)',
                padding: '10px 14px',
                width: '100%',
                outline: 'none',
                borderRadius: '0',
                transition: 'border-color 0.15s ease',
              }}
            />

            <AnimatePresence>
              {error && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-faint)',
                    letterSpacing: '0.05em',
                  }}
                >
                  incorrect
                </motion.span>
              )}
            </AnimatePresence>

            <button
              onClick={attempt}
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid var(--ink)',
                background: 'transparent',
                color: 'var(--ink)',
                padding: '10px 28px',
                cursor: 'pointer',
                marginTop: '4px',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.background = 'var(--ink)'
                btn.style.color = 'var(--bg)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.background = 'transparent'
                btn.style.color = 'var(--ink)'
              }}
            >
              Enter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
