'use client'

import { AnimatePresence, motion } from 'framer-motion'

export type HoverState =
  | null
  | { type: 'work' }
  | { type: 'project'; id: string }
  | { type: 'about' }
  | { type: 'explorations' }

// ── Image dimensions ─────────────────────────────────────────────────────────
const W = 280   // image width px
const H = 210   // image height px
const G = 20    // gap between images px

// ── Responsive anchor positions (calc from viewport 50%) ─────────────────────
const COL_L = 'calc(50% - 500px)'
const COL_R = 'calc(50% - 200px)'

// ── Vertical anchor — single value controls entire cluster's vertical position.
const VCENTER = '35%'

// Row vertical positions — cluster is centered at VCENTER
const ROW_1 = `calc(${VCENTER} - ${H / 2 + G / 2 + H / 2}px)`
const ROW_2 = `calc(${VCENTER} + ${G / 2}px)`

// Single centered image (for explorations row 2 / about)
const COL_C = `calc(50% - ${W / 2 + G / 2 + W / 4}px)`
const ROW_M = `calc(${VCENTER} - ${H / 2}px)`

// Large feature image for expanded state
const EXP_W    = 400
const EXP_H    = 300
const EXP_LEFT = 'calc(50% - 530px)'
const EXP_TOP  = `calc(${VCENTER} - ${EXP_H / 2}px)`

interface ImageDef {
  id: string
  src: string
  alt: string
  left: string
  top: string
  delay: number
  projectId?: string
}

// Work — 2×2 grid, each image maps to a project
const WORK_CLUSTER: ImageDef[] = [
  { id: 'w1', src: '/work-1.jpg', alt: 'Work 1', left: COL_L, top: ROW_1, delay: 0,    projectId: 'influence' },
  { id: 'w2', src: '/work-2.jpg', alt: 'Work 2', left: COL_R, top: ROW_1, delay: 0.07, projectId: 'ai_email'  },
  { id: 'w3', src: '/github-hero.avif', alt: 'GitHub', left: COL_L, top: ROW_2, delay: 0.12, projectId: 'github'    },
  { id: 'w4', src: '/work-4.jpg', alt: 'Work 4', left: COL_R, top: ROW_2, delay: 0.05, projectId: 'sony'      },
]

// About — two images side by side, vertically centered
const ABOUT_CLUSTER: ImageDef[] = [
  { id: 'a1', src: '/about-1.jpg', alt: 'About 1', left: COL_L, top: ROW_M, delay: 0    },
  { id: 'a2', src: '/about-2.jpg', alt: 'About 2', left: COL_R, top: ROW_M, delay: 0.08 },
]

// Explorations — two on top, one centered below
const EXPLORATIONS_CLUSTER: ImageDef[] = [
  { id: 'e1', src: '/explorations-1.jpg', alt: 'Exploration 1', left: COL_L, top: ROW_1, delay: 0    },
  { id: 'e2', src: '/explorations-2.jpg', alt: 'Exploration 2', left: COL_R, top: ROW_1, delay: 0.07 },
  { id: 'e3', src: '/explorations-3.jpg', alt: 'Exploration 3', left: COL_C, top: ROW_2, delay: 0.14 },
]

const ALL_IMAGES = [...WORK_CLUSTER, ...ABOUT_CLUSTER, ...EXPLORATIONS_CLUSTER]

// Project id → expanded feature image src
const PROJECT_IMG: Record<string, string> = {
  influence: '/work-1.jpg',
  ai_email:  '/work-2.jpg',
  github:    '/github-hero.avif',
  sony:      '/work-4.jpg',
}

function isVisible(img: ImageDef, state: HoverState): boolean {
  if (!state) return false
  if (state.type === 'work')         return WORK_CLUSTER.some(w => w.id === img.id)
  if (state.type === 'project')      return WORK_CLUSTER.some(w => w.id === img.id && w.projectId === state.id)
  if (state.type === 'about')        return ABOUT_CLUSTER.some(a => a.id === img.id)
  if (state.type === 'explorations') return EXPLORATIONS_CLUSTER.some(e => e.id === img.id)
  return false
}

function PhotoFrame({ img, w, h }: { img: ImageDef; w: number; h: number }) {
  return (
    <div style={{
      width:  `${w}px`,
      height: `${h}px`,
      borderRadius: '6px',
      overflow: 'hidden',
      background: '#cec9bf',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      position: 'relative',
    }}>
      {/* Placeholder — visible until real image loads */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px',
        color: '#9b9690', letterSpacing: '0.08em',
      }}>
        {img.src.replace('/', '')}
      </div>
      <img
        src={img.src}
        alt={img.alt}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', display: 'block',
          mixBlendMode: 'multiply',
        }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
      />
    </div>
  )
}

export default function HoverImages({
  hoverState,
  expandedProjectId,
}: {
  hoverState: HoverState
  expandedProjectId?: string | null
}) {
  const isExpanded = !!expandedProjectId

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>

      {/* Expanded feature image — single large image when a project is open */}
      <AnimatePresence>
        {isExpanded && expandedProjectId && (
          <motion.div
            key={`expanded-${expandedProjectId}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' } }}
            style={{ position: 'absolute', left: EXP_LEFT, top: EXP_TOP }}
          >
            <PhotoFrame
              img={{
                id: 'exp',
                src: PROJECT_IMG[expandedProjectId] ?? '/work-1.jpg',
                alt: expandedProjectId,
                left: EXP_LEFT,
                top: EXP_TOP,
                delay: 0,
              }}
              w={EXP_W}
              h={EXP_H}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal hover images — hidden when a project is expanded */}
      {!isExpanded && ALL_IMAGES.map(img => (
        <AnimatePresence key={img.id}>
          {isVisible(img, hoverState) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: img.delay } }}
              exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
              style={{ position: 'absolute', left: img.left, top: img.top }}
            >
              <PhotoFrame img={img} w={W} h={H} />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

    </div>
  )
}
