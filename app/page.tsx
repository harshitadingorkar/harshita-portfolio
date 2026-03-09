'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import RightPanel from '@/components/RightPanel'
import HoverImages, { type HoverState } from '@/components/HoverImages'

const UnicornHero = dynamic(() => import('@/components/UnicornHero'), { ssr: false })

// Matches HoverImages.tsx PROJECT_IMG
const PROJECT_IMG: Record<string, string> = {
  influence: '/work-1.jpg',
  ai_email:  '/work-2.jpg',
  github:    '/work-3.jpg',
  sony:      '/work-4.jpg',
}

export default function HomePage() {
  const router = useRouter()
  const [hoverState,        setHoverState]        = useState<HoverState>(null)
  const [unicornReady,      setUnicornReady]      = useState(false)
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [coverTransition,   setCoverTransition]   = useState<{ projectId: string; route: string } | null>(null)

  function handleNavigate(route: string, projectId: string) {
    setCoverTransition({ projectId, route })
  }

  return (
    <>
      {/* ── Cover transition: image grows to fill viewport ──── */}
      <AnimatePresence>
        {coverTransition && (
          <motion.div
            key="cover"
            initial={{ clipPath: 'inset(18% 41% 48% 13% round 6px)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => router.push(coverTransition.route)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              backgroundImage: `url(${PROJECT_IMG[coverTransition.projectId] ?? '/work-1.jpg'})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundColor: '#1a1918',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── UI layer — fades in once Unicorn scene is ready ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: unicornReady ? 1 : 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ pointerEvents: unicornReady ? 'auto' : 'none' }}
      >
        <HoverImages hoverState={hoverState} expandedProjectId={expandedProjectId} />
        <RightPanel
          onHoverChange={setHoverState}
          onProjectExpand={setExpandedProjectId}
          onNavigate={handleNavigate}
        />
      </motion.div>

      {/* ── Single viewport — no scroll ────────────────────── */}
      <div style={{ height: '100vh', background: '#1a1918', overflow: 'hidden' }}>
        <UnicornHero onReady={() => setUnicornReady(true)} />
      </div>
    </>
  )
}
