'use client'

import { useEffect, useRef, useState } from 'react'

// ── Storage key ───────────────────────────────────────────────────────────────
const KEY = 'dev_edit_v2'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Change { selector: string; dx: number; dy: number; text?: string }
type Entry =
  | { type: 'move'; selector: string; prevDx: number; prevDy: number }
  | { type: 'text'; selector: string; prevText: string }
type Rect = { x: number; y: number; w: number; h: number }

// ── Selector: stable CSS path to identify an element across reloads ───────────
function mkSel(el: HTMLElement): string {
  if (el.dataset.hoverImageId) return `[data-hover-image-id="${el.dataset.hoverImageId}"]`
  if (el.dataset.editable)     return `[data-editable="${el.dataset.editable}"]`
  if (el.id && !/^(us-|radix-)/.test(el.id)) return `#${el.id}`
  const parts: string[] = []
  let cur: HTMLElement | null = el
  while (cur && cur !== document.body) {
    const parent: HTMLElement | null = cur.parentElement
    if (!parent) break
    const sib = Array.from(parent.children).filter((c): c is HTMLElement => c.tagName === cur!.tagName)
    const tag = cur.tagName.toLowerCase()
    parts.unshift(sib.length > 1 ? `${tag}:nth-of-type(${sib.indexOf(cur) + 1})` : tag)
    cur = parent
  }
  return parts.join('>') || el.tagName.toLowerCase()
}

// ── Transform helpers ─────────────────────────────────────────────────────────
function getTx(el: HTMLElement): [number, number] {
  const m = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0]
}
function setTx(el: HTMLElement, dx: number, dy: number) {
  el.style.transform = dx === 0 && dy === 0 ? '' : `translate(${Math.round(dx)}px,${Math.round(dy)}px)`
}
function toRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

// ── Guards ────────────────────────────────────────────────────────────────────
function isUI(el: Element | null): boolean { return !!el?.closest('[data-dev-ui]') }
function isFormEl(el: HTMLElement): boolean {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}
// Find closest element suitable for text editing
function findTextEl(el: HTMLElement): HTMLElement | null {
  if (isFormEl(el)) return null
  const t = el.closest<HTMLElement>('p,h1,h2,h3,h4,h5,h6,span,a,li')
  if (t && !t.querySelector('img')) return t
  if (!el.querySelector('img,video,canvas') && el.textContent?.trim()) return el
  return null
}

// ── Persistence ───────────────────────────────────────────────────────────────
function loadSaved(): Change[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
function persist(m: Map<string, Change>) {
  const list = Array.from(m.values()).filter(c => c.dx !== 0 || c.dy !== 0 || c.text !== undefined)
  localStorage.setItem(KEY, JSON.stringify(list))
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DevEditTool() {
  const [on,      setOn]      = useState(false)
  const [hovBox,  setHovBox]  = useState<Rect | null>(null)
  const [selBox,  setSelBox]  = useState<Rect | null>(null)
  const [isText,  setIsText]  = useState(false)
  const [saveOk,  setSaveOk]  = useState(false)
  const [histLen, setHistLen] = useState(0)

  const selEl    = useRef<HTMLElement | null>(null)
  const history  = useRef<Entry[]>([])
  const changes  = useRef<Map<string, Change>>(new Map())
  const drag     = useRef<{ el: HTMLElement; mx: number; my: number; ox: number; oy: number } | null>(null)
  const dragging = useRef(false)
  const editing  = useRef(false)
  const raf      = useRef(0)

  // ── Apply saved changes on mount ──────────────────────────────────────────
  useEffect(() => {
    for (const c of loadSaved()) {
      try {
        const el = document.querySelector<HTMLElement>(c.selector)
        if (!el) continue
        if (c.dx || c.dy) setTx(el, c.dx, c.dy)
        if (c.text !== undefined) el.textContent = c.text
        changes.current.set(c.selector, c)
      } catch {}
    }
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setOn(v => !v)
      }
      if (e.key === 'Escape' && on) { doDeselect(); setOn(false) }
      if (mod && e.key === 'z' && on && !editing.current) { e.preventDefault(); doUndo() }
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [on]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Edit-mode mouse listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!on) { setHovBox(null); setSelBox(null); return }

    const onMove = (e: MouseEvent) => {
      if (dragging.current) { moveDrag(e); return }
      const el = e.target as HTMLElement
      if (isUI(el) || el === document.body || !el) { setHovBox(null); return }
      setHovBox(toRect(el))
    }

    const onDown = (e: MouseEvent) => {
      if (isUI(e.target as HTMLElement)) return
      const target = e.target as HTMLElement
      if (!target || target === document.body || isFormEl(target)) return

      // Finish text edit when clicking outside the editable element
      if (editing.current && selEl.current && !selEl.current.contains(target)) {
        doEndEdit(selEl.current)
      }

      // Clicking on already-selected element → start drag (unless text editing)
      const cur = selEl.current
      if (cur && (cur === target || cur.contains(target)) && !editing.current) {
        e.preventDefault()
        startDrag(e, cur)
        return
      }

      // Select clicked element
      selEl.current = target
      setSelBox(toRect(target))
      setIsText(false)
    }

    const onUp   = (e: MouseEvent) => { if (dragging.current) endDrag(e) }
    const onDbl  = (e: MouseEvent) => {
      if (isUI(e.target as HTMLElement)) return
      const el = findTextEl(e.target as HTMLElement)
      if (el) startEdit(el)
    }
    const refresh = () => { if (selEl.current) setSelBox(toRect(selEl.current)) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('dblclick',  onDbl)
    window.addEventListener('scroll',    refresh, true)
    window.addEventListener('resize',    refresh)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('dblclick',  onDbl)
      window.removeEventListener('scroll',    refresh, true)
      window.removeEventListener('resize',    refresh)
    }
  }, [on]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────
  function doDeselect() {
    if (selEl.current && editing.current) doEndEdit(selEl.current)
    selEl.current = null
    setSelBox(null)
    setIsText(false)
    editing.current = false
  }

  function startDrag(e: MouseEvent, el: HTMLElement) {
    e.preventDefault()
    const [ox, oy] = getTx(el)
    dragging.current = true
    drag.current = { el, mx: e.clientX, my: e.clientY, ox, oy }
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
    history.current.push({ type: 'move', selector: mkSel(el), prevDx: ox, prevDy: oy })
    setHistLen(history.current.length)
  }

  function moveDrag(e: MouseEvent) {
    const d = drag.current
    if (!d) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const dx = d.ox + (e.clientX - d.mx)
      const dy = d.oy + (e.clientY - d.my)
      setTx(d.el, dx, dy)
      setSelBox(toRect(d.el))
    })
  }

  function endDrag(e: MouseEvent) {
    const d = drag.current
    if (!d) return
    dragging.current = false
    d.el.style.cursor = ''
    d.el.style.userSelect = ''
    const dx = d.ox + (e.clientX - d.mx)
    const dy = d.oy + (e.clientY - d.my)
    setTx(d.el, dx, dy)
    const s = mkSel(d.el)
    const ex = changes.current.get(s) ?? { selector: s, dx: 0, dy: 0 }
    changes.current.set(s, { ...ex, dx, dy })
    setSelBox(toRect(d.el))
    drag.current = null
  }

  function startEdit(el: HTMLElement) {
    if (editing.current) return
    history.current.push({ type: 'text', selector: mkSel(el), prevText: el.textContent ?? '' })
    setHistLen(history.current.length)
    selEl.current = el
    editing.current = true
    setIsText(true)
    setSelBox(toRect(el))
    el.contentEditable = 'true'
    el.style.outline = 'none'
    el.style.caretColor = '#2563eb'
    el.style.backgroundColor = 'rgba(37,99,235,0.06)'
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  function doEndEdit(el: HTMLElement) {
    el.contentEditable = 'false'
    el.style.backgroundColor = ''
    el.style.caretColor = ''
    editing.current = false
    setIsText(false)
    const s = mkSel(el)
    const ex = changes.current.get(s) ?? { selector: s, dx: 0, dy: 0 }
    changes.current.set(s, { ...ex, text: el.textContent ?? '' })
  }

  function doUndo() {
    const entry = history.current.pop()
    if (!entry) return
    setHistLen(history.current.length)
    try {
      const el = document.querySelector<HTMLElement>(entry.selector)
      if (!el) return
      if (entry.type === 'move') {
        setTx(el, entry.prevDx, entry.prevDy)
        const ex = changes.current.get(entry.selector)
        if (ex) changes.current.set(entry.selector, { ...ex, dx: entry.prevDx, dy: entry.prevDy })
        if (selEl.current === el) setSelBox(toRect(el))
      } else {
        el.textContent = entry.prevText
        const ex = changes.current.get(entry.selector)
        if (ex) changes.current.set(entry.selector, { ...ex, text: entry.prevText })
      }
    } catch {}
  }

  function doSave() {
    persist(changes.current)
    setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2000)
  }

  function doReset() {
    localStorage.removeItem(KEY)
    window.location.reload()
  }

  if (!on) return null

  const MONO = 'var(--font-ibm-plex-mono, monospace)'
  const RED  = '#c84b2f'
  const BLUE = '#2563eb'
  const HANDLES = [
    { top: -4,  left: -4 },
    { top: -4,  right: -4 },
    { bottom: -4, left: -4 },
    { bottom: -4, right: -4 },
  ] as const

  return (
    <>
      {/* Hover outline */}
      {hovBox && !dragging.current && (
        <div data-dev-ui style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9990,
          left: hovBox.x - 1, top: hovBox.y - 1,
          width: hovBox.w + 2, height: hovBox.h + 2,
          border: '1px solid rgba(200,75,47,0.35)',
          borderRadius: 2, boxSizing: 'border-box',
        }} />
      )}

      {/* Selection box + handles + tooltip */}
      {selBox && (
        <div data-dev-ui style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9991,
          left: selBox.x - 2, top: selBox.y - 2,
          width: selBox.w + 4, height: selBox.h + 4,
          border: `2px solid ${isText ? BLUE : RED}`,
          borderRadius: 2, boxSizing: 'border-box',
        }}>
          {/* Corner handles (drag mode only) */}
          {!isText && HANDLES.map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 7, height: 7,
              background: '#fff', border: `1.5px solid ${RED}`,
              borderRadius: 1, boxSizing: 'border-box',
              ...pos,
            }} />
          ))}

          {/* Tooltip label */}
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.07em',
            color: isText ? BLUE : RED,
            background: 'rgba(255,255,255,0.97)',
            padding: '3px 8px', borderRadius: 3,
            whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            {isText ? '✎ editing — click outside to finish' : 'drag to move · dbl-click to edit text'}
          </div>
        </div>
      )}

      {/* Edit mode badge */}
      <div data-dev-ui style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em',
        color: RED, background: 'rgba(28,27,25,0.92)',
        padding: '4px 12px', borderRadius: 20,
        userSelect: 'none', pointerEvents: 'none',
      }}>
        ● EDIT MODE
      </div>

      {/* Toolbar */}
      <div data-dev-ui style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', gap: 4, alignItems: 'center',
        background: '#1c1b19', padding: '6px 8px', borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {([
          { label: saveOk ? '✓ SAVED' : 'SAVE',           fn: doSave,                            ok: saveOk,    dim: false         },
          { label: histLen ? `UNDO (${histLen})` : 'UNDO', fn: doUndo,                            ok: false,     dim: histLen === 0 },
          { label: 'RESET',                                fn: doReset,                           ok: false,     dim: false         },
          { label: 'EXIT',                                 fn: () => { doDeselect(); setOn(false) }, ok: false,  dim: false         },
        ] as const).map(({ label, fn, ok, dim }) => (
          <button
            key={label}
            onClick={fn as () => void}
            style={{
              fontFamily: MONO, letterSpacing: '0.1em',
              background: 'transparent',
              border: `1px solid ${ok ? '#22c55e' : dim ? 'rgba(237,233,227,0.12)' : 'rgba(237,233,227,0.25)'}`,
              color: ok ? '#22c55e' : dim ? 'rgba(237,233,227,0.3)' : '#ede9e3',
              fontSize: 9, padding: '4px 10px', borderRadius: 4,
              cursor: dim ? 'default' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
