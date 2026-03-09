'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// ── Storage helpers ───────────────────────────────────────────────────────────
const ss = {
  get:  (k: string) => (typeof window !== 'undefined' ? sessionStorage.getItem(k) : null),
  set:  (k: string, v: string) => { if (typeof window !== 'undefined') sessionStorage.setItem(k, v) },
  json: <T,>(k: string, fb: T): T => {
    const v = typeof window !== 'undefined' ? sessionStorage.getItem(k) : null
    if (!v) return fb
    try { return JSON.parse(v) } catch { return fb }
  },
}
const ls = {
  get: (k: string) => (typeof window !== 'undefined' ? localStorage.getItem(k) : null),
  set: (k: string, v: string) => { if (typeof window !== 'undefined') localStorage.setItem(k, v) },
}

// ── Patron name from localStorage ────────────────────────────────────────────
function getPatronName(): string {
  const raw = ls.get('patron_data')
  if (!raw) return 'friend'
  try { return JSON.parse(raw).name ?? 'friend' } catch { return 'friend' }
}

// ── Session tracking ──────────────────────────────────────────────────────────
const GAP_MS = 60_000

function shownSet(): Set<string> { return new Set(ss.json<string[]>('sv_shown', [])) }
function markShown(id: string) {
  const s = shownSet(); s.add(id)
  ss.set('sv_shown', JSON.stringify(Array.from(s)))
  ss.set('sv_last', String(Date.now()))
}
function canShow(id: string): boolean {
  if (shownSet().has(id)) return false
  const last = parseInt(ss.get('sv_last') ?? '0', 10)
  return Date.now() - last >= GAP_MS
}

// ── Duration by word count ────────────────────────────────────────────────────
function msgDuration(text: string): number {
  const w = text.trim().split(/\s+/).length
  if (w < 6)   return 12_000
  if (w <= 10) return 16_000
  return 20_000
}

// ── Pick random from array ────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// ── Time window ───────────────────────────────────────────────────────────────
function timeWindow(): string | null {
  const h = new Date().getHours(), d = new Date().getDay()
  if (h >= 0  && h < 4)  return 'late_night'
  if (h >= 5  && h < 7)  return 'early'
  if (d === 5 && h >= 17 && h < 22) return 'friday_eve'
  if (d === 0 && h >= 18 && h < 22) return 'sunday_eve'
  return null
}

// ── Seasonal window ───────────────────────────────────────────────────────────
function seasonalWindow(): string | null {
  const m = new Date().getMonth()
  if (m === 2)  return 'march'
  if (m === 11) return 'december'
  return null
}

// ── Returning visitor message ─────────────────────────────────────────────────
function returningVisitorMsg(): string | null {
  const raw = ls.get('sv_last_visit')
  if (!raw) return null
  const diff = Date.now() - parseInt(raw, 10)
  const DAY  = 86_400_000
  if (diff < DAY)        return 'back again :) something caught your eye?'
  if (diff < 6 * DAY)   return "you came back. i updated a few things, maybe you'll notice."
  if (diff < 30 * DAY)  return "oh good, you're back."
  return 'been a while. glad you found your way back.'
}

// ── Case study visit tracking ─────────────────────────────────────────────────
function markCaseVisited(id: string) {
  const v = ss.json<string[]>('sv_cases', [])
  if (!v.includes(id)) ss.set('sv_cases', JSON.stringify([...v, id]))
}
function allCasesVisited(): boolean {
  const v = ss.json<string[]>('sv_cases', [])
  return ['influence', 'ai_email', 'github', 'sony'].every(id => v.includes(id))
}

// ── Case study map ────────────────────────────────────────────────────────────
const CASE_IDS: Record<string, string> = {
  '/work/influence-graph':    'influence',
  '/work/ai-email-assistant': 'ai_email',
  '/work/github':             'github',
  '/work/sony':               'sony',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SiteVoice() {
  const pathname = usePathname()
  const caseId   = CASE_IDS[pathname] ?? null

  // Light text on the blue Unicorn canvas (homepage), dark grey on case study light backgrounds
  const isWorkPage = pathname.startsWith('/work/')
  const msgColor   = isWorkPage ? '#5c5852' : 'rgba(255,255,255,0.65)'

  const INITIAL_DELAY = 3_000

  // ── Display state ───────────────────────────────────────────────────────────
  const [isVisible,  setIsVisible]  = useState(false)
  const [displayed,  setDisplayed]  = useState('')

  // ── Refs ────────────────────────────────────────────────────────────────────
  const readyRef     = useRef(false)
  const isVisibleRef = useRef(false)
  const displaceRef  = useRef<SVGFEDisplacementMapElement>(null)
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const typeRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const holdRef      = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pendingRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rafRef       = useRef<number | undefined>(undefined)

  // ── Dissolve (Marauder's Map via rAF on SVG filter) ─────────────────────────
  const startDissolve = useCallback(() => {
    const dispEl  = displaceRef.current
    const wrapper = wrapperRef.current
    if (!dispEl || !wrapper) {
      setIsVisible(false); isVisibleRef.current = false; setDisplayed(''); return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const el = now - start
      if (el < 400) {
        dispEl.setAttribute('scale', String((el / 400) * 20))
      } else if (el < 900) {
        const t = (el - 400) / 500
        dispEl.setAttribute('scale', String(20 + t * 15))
        wrapper.style.opacity = String(1 - t)
      } else {
        dispEl.setAttribute('scale', '0')
        wrapper.style.opacity = '1'
        setIsVisible(false)
        isVisibleRef.current = false
        setDisplayed('')
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Show: terminal typewriter then schedule dissolve ──────────────────────
  const startShow = useCallback((message: string) => {
    clearInterval(typeRef.current)
    clearTimeout(holdRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    isVisibleRef.current = true
    setIsVisible(true)
    setDisplayed('')

    if (displaceRef.current) displaceRef.current.setAttribute('scale', '0')
    if (wrapperRef.current)  wrapperRef.current.style.opacity = '1'

    let i = 0
    typeRef.current = setInterval(() => {
      i++
      setDisplayed(message.slice(0, i))
      if (i >= message.length) {
        clearInterval(typeRef.current)
        // Dissolve starts 2 seconds before end of visible duration
        const holdMs = msgDuration(message) - 2000
        holdRef.current = setTimeout(startDissolve, Math.max(holdMs, 500))
      }
    }, 38)
  }, [startDissolve])

  // ── Trigger (all guards in one place) ────────────────────────────────────
  const trigger = useCallback((id: string, message: string): boolean => {
    if (!readyRef.current || isVisibleRef.current) return false
    if (!canShow(id)) return false
    markShown(id)
    startShow(message)
    return true
  }, [startShow])

  const queue = useCallback((id: string, message: string, delay: number) => {
    clearTimeout(pendingRef.current)
    if (delay > 0) {
      pendingRef.current = setTimeout(() => trigger(id, message), delay)
    } else {
      trigger(id, message)
    }
  }, [trigger])

  // ── Gate: readyRef becomes true after INITIAL_DELAY ───────────────────────
  useEffect(() => {
    readyRef.current = false
    const t = setTimeout(() => { readyRef.current = true }, INITIAL_DELAY)
    return () => { clearTimeout(t); readyRef.current = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Time-based (checked once per page load) ───────────────────────────────
  useEffect(() => {
    const win = timeWindow()
    if (!win) return
    const map: Record<string, { id: string; text: string }> = {
      late_night: { id: 'time_late',   text: "you're up late. me too, honestly — hit me up sometime" },
      early:      { id: 'time_early',  text: 'early bird. i respect that.' },
      friday_eve: { id: 'time_friday', text: 'happy friday :)' },
      sunday_eve: { id: 'time_sunday', text: 'sunday nights are for portfolios apparently. here we both are.' },
    }
    const { id, text } = map[win]
    queue(id, text, INITIAL_DELAY + 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Seasonal (homepage only, once per session) ────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    const win = seasonalWindow()
    if (!win) return
    const map: Record<string, { id: string; text: string }> = {
      march:    { id: 'seasonal_march',    text: 'built a lot of this in march. the grey helps somehow.' },
      december: { id: 'seasonal_december', text: 'december somehow always feels like the right time to make things' },
    }
    const { id, text } = map[win]
    queue(id, text, INITIAL_DELAY + 4000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Hero: first ever visit ────────────────────────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    if (ls.get('sv_hero_first')) return
    ls.set('sv_hero_first', '1')
    // TEST — REMOVE LATER
    const name = getPatronName()
    queue('hero_first', `hi there, i'm going to call you ${name} :)`, INITIAL_DELAY + 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Returning visitor (second session onward) ─────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    const msg = returningVisitorMsg()
    ls.set('sv_last_visit', String(Date.now()))
    if (!msg) return
    queue('returning_visitor', msg, INITIAL_DELAY + 4000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Hero: idle 45s ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    let scrolled = false
    const onScroll = () => { scrolled = true }
    window.addEventListener('scroll', onScroll, { passive: true })
    const opts = [
      "i keep rearranging this page. it's a thing.",
      'took me a while to write that headline.',
      'glad this exists, honestly.',
    ]
    const t = setTimeout(() => {
      if (!scrolled) queue('hero_idle', pick(opts), 0)
    }, 45_000)
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Idle: 2 min no interaction (any page, once per session) ──────────────
  useEffect(() => {
    if (ss.get('sv_idle_done')) return
    let idleTimer: ReturnType<typeof setTimeout>
    const opts = ['no rush. really.', "i'll be here.", 'take your time with it']
    const reset = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        ss.set('sv_idle_done', '1')
        queue('idle_2min', pick(opts), 0)
      }, 120_000)
    }
    reset()
    window.addEventListener('mousemove', reset, { passive: true })
    window.addEventListener('keydown', reset, { passive: true })
    return () => {
      clearTimeout(idleTimer)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Longer than expected ──────────────────────────────────────────────────
  useEffect(() => {
    const threshold = caseId ? 240_000 : 90_000
    const opts = [
      'like what you see? tell me :)',
      "hope you're finding time to do things you love today",
      'still here — means something to me, genuinely',
      'take all the time you need',
      'i see you, taking your time. i appreciate that more than you know',
    ]
    const id = `linger_${pathname.replace(/\//g, '_')}`
    const t = setTimeout(() => {
      queue(id, pick(opts), 0)
    }, threshold)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── Section-based (dispatched from RightPanel via sv:section event) ───────
  useEffect(() => {
    const handler = (e: Event) => {
      const { section } = (e as CustomEvent<{ section: string }>).detail
      if (section === 'work') {
        // TEST — REMOVE LATER
        const opts = [
          'this section took the longest to get right',
          "i'm proud of this. i think.",
          'these are the ones that kept me up at night. in a good way mostly.',
        ]
        queue('work_enter', pick(opts), 500)
      } else if (section === 'explorations') {
        // TEST — REMOVE LATER
        const opts = [
          'this part is really me',
          "the stuff that doesn't fit anywhere else. which is maybe why i like it most.",
          "i almost didn't put this section in.",
        ]
        queue('explorations_enter', pick(opts), 500)
      } else if (section === 'about') {
        // TEST — REMOVE LATER
        const opts = [
          'this part was hard to write',
          "i've rewritten this more than anything else on the site",
          "still not sure i got this right",
        ]
        queue('about_enter', pick(opts), 500)
      }
    }
    window.addEventListener('sv:section', handler)
    return () => window.removeEventListener('sv:section', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Project hover 8s dwell ────────────────────────────────────────────────
  useEffect(() => {
    const msgs: Record<string, string> = {
      influence: 'this one changed how i think about what AI can show you',
      ai_email:  'i rewrote the rationale for this about six times',
      github:    'this is where i figured out what kind of designer i am',
      sony:      'this one surprised me. the research especially.',
    }
    let hoverTimer: ReturnType<typeof setTimeout>
    const onHover  = (e: Event) => {
      const { id } = (e as CustomEvent<{ id: string }>).detail
      clearTimeout(hoverTimer)
      if (id && msgs[id]) hoverTimer = setTimeout(() => trigger(`proj_hover_${id}`, msgs[id]), 8_000)
    }
    const onEnd = () => clearTimeout(hoverTimer)
    window.addEventListener('sv:project-hover', onHover)
    window.addEventListener('sv:project-hover-end', onEnd)
    return () => {
      clearTimeout(hoverTimer)
      window.removeEventListener('sv:project-hover', onHover)
      window.removeEventListener('sv:project-hover-end', onEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Case study: track visit + on-load message ─────────────────────────────
  useEffect(() => {
    if (!caseId) return
    markCaseVisited(caseId)
    const caseLoadMsgs: Record<string, string> = {
      influence: 'still figuring out how to talk about this one',
      ai_email:  "this one i'm quietly very proud of",
      github:    'this is where it started, in a way',
      sony:      'a good place to begin, i think',
    }
    // TEST — REMOVE LATER
    queue(`case_load_${caseId}`, caseLoadMsgs[caseId], 3000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  // ── All 4 case studies visited (checked per case study load) ─────────────
  useEffect(() => {
    if (!caseId) return
    if (!allCasesVisited()) return
    queue('all_cases_done', "you've seen all of it now. thank you for that.", 5000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  // ── Case study: scroll depth ──────────────────────────────────────────────
  useEffect(() => {
    if (!caseId) return
    let hit60 = false, hit100 = false
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
      if (!hit60  && depth >= 0.60) {
        hit60 = true
        // TEST — REMOVE LATER
        const opts60 = ["you're still here! hi", "you're actually reading this. that means a lot.", "most people don't get this far :)"]
        trigger(`case_60_${caseId}`, pick(opts60))
      }
      if (!hit100 && depth >= 0.99) {
        hit100 = true
        // TEST — REMOVE LATER
        const opts100 = ["that's all of it :)", 'thank you for reading all of it', "you read everything. i hope something stuck."]
        trigger(`case_100_${caseId}`, pick(opts100))
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  // ── Cursor speed ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (ss.get('sv_slow_done')) return
    type Pt = { x: number; y: number; t: number }
    const pts: Pt[] = []
    let fired = false
    const onMove = (e: MouseEvent) => {
      if (fired) return
      const now = Date.now()
      pts.push({ x: e.clientX, y: e.clientY, t: now })
      while (pts.length && pts[0].t < now - 400) pts.shift()
      if (pts.length < 2) return
      const f = pts[0], l = pts[pts.length - 1]
      const dt = (l.t - f.t) / 1000
      if (!dt) return
      const v = Math.sqrt((l.x - f.x) ** 2 + (l.y - f.y) ** 2) / dt
      if (v > 800) {
        fired = true
        ss.set('sv_slow_done', '1')
        const opts = ['sloww down :)', "there's more here than there looks", "this is worth the time, i promise"]
        queue('slow_down', pick(opts), 1500)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* SVG filter — always in DOM so ref is stable */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden>
        <defs>
          <filter id="voice-dissolve">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="4"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Message — fixed bottom-left, identical on all pages */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '52px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="3" cy="3" r="3" fill="#c84b2f" />
          </svg>
          <div
            ref={wrapperRef}
            style={{
              filter: 'url(#voice-dissolve)',
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '11px',
              color: msgColor,
              letterSpacing: '0.04em',
              lineHeight: 1.6,
              maxWidth: '320px',
            }}
          >
            {displayed}
          </div>
        </div>
      )}
    </>
  )
}
