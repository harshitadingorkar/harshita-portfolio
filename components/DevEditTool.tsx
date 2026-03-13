'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// ── Storage key ───────────────────────────────────────────────────────────────
const KEY = 'dev_edit_v2'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Change {
  selector: string
  dx: number
  dy: number
  text?: string
  width?: string
  height?: string
  imageSrc?: string
}

type Entry =
  | { type: 'move';   selector: string; prevDx: number; prevDy: number }
  | { type: 'text';   selector: string; prevText: string }
  | { type: 'resize'; selector: string; prevW: string; prevH: string }
  | { type: 'image';  selector: string; prevSrc: string }

type Rect = { x: number; y: number; w: number; h: number }

type ResizeDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface ResizeState {
  el: HTMLElement
  dir: ResizeDir
  mx: number
  my: number
  origW: number
  origH: number
  origDx: number
  origDy: number
}

// ── Selector: stable CSS path to identify an element across reloads ───────────
function mkSel(el: HTMLElement): string {
  if (el.dataset.hoverImageId) return `[data-hover-image-id="${el.dataset.hoverImageId}"]`
  if (el.dataset.editable)     return `[data-editable="${el.dataset.editable}"]`
  if (el.id && !/^(us-|radix-)/.test(el.id)) return `#${el.id}`
  const parts: string[] = []
  let cur: HTMLElement | null = el
  while (cur && cur !== document.body) {
    const p: HTMLElement | null = cur.parentElement
    if (!p) break
    const sib = Array.from(p.children).filter((c): c is HTMLElement => c.tagName === cur!.tagName)
    const tag = cur.tagName.toLowerCase()
    parts.unshift(sib.length > 1 ? `${tag}:nth-of-type(${sib.indexOf(cur) + 1})` : tag)
    cur = p
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
  const list = Array.from(m.values()).filter(
    c => c.dx !== 0 || c.dy !== 0 || c.text !== undefined || c.width !== undefined || c.imageSrc !== undefined
  )
  localStorage.setItem(KEY, JSON.stringify(list))
}

// ── Resize handle definitions ─────────────────────────────────────────────────
const RESIZE_HANDLES: { dir: ResizeDir; style: CSSProperties; cursor: string }[] = [
  { dir: 'nw', style: { top: 0, left: 0 }, cursor: 'nwse-resize' },
  { dir: 'n',  style: { top: 0, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
  { dir: 'ne', style: { top: 0, right: 0 }, cursor: 'nesw-resize' },
  { dir: 'e',  style: { top: '50%', right: 0, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  { dir: 'se', style: { bottom: 0, right: 0 }, cursor: 'nwse-resize' },
  { dir: 's',  style: { bottom: 0, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
  { dir: 'sw', style: { bottom: 0, left: 0 }, cursor: 'nesw-resize' },
  { dir: 'w',  style: { top: '50%', left: 0, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function DevEditTool() {
  const [on,      setOn]      = useState(false)
  const [hovBox,  setHovBox]  = useState<Rect | null>(null)
  const [selBox,  setSelBox]  = useState<Rect | null>(null)
  const [isText,  setIsText]  = useState(false)
  const [isImg,   setIsImg]   = useState(false)
  const [saveOk,  setSaveOk]  = useState(false)
  const [histLen, setHistLen] = useState(0)
  const [dropTarget,    setDropTarget]    = useState<{ rect: Rect } | null>(null)
  const [contentOpen,   setContentOpen]   = useState(false)
  const [contentBlocks, setContentBlocks] = useState<{ sel: string; tag: string; text: string }[]>([])

  const selEl      = useRef<HTMLElement | undefined>(undefined)
  const history    = useRef<Entry[]>([])
  const changes    = useRef<Map<string, Change>>(new Map())
  const drag       = useRef<{ el: HTMLElement; mx: number; my: number; ox: number; oy: number } | null>(null)
  const dragging   = useRef(false)
  const editing    = useRef(false)
  const raf        = useRef(0)
  const resizeRef  = useRef<ResizeState | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ── Broadcast edit mode to other components ───────────────────────────────
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dev:edit-mode', { detail: { on } }))
  }, [on])

  // ── Apply saved changes on mount ──────────────────────────────────────────
  useEffect(() => {
    for (const c of loadSaved()) {
      try {
        const el = document.querySelector<HTMLElement>(c.selector)
        if (!el) continue
        if (c.dx || c.dy) setTx(el, c.dx, c.dy)
        if (c.text !== undefined) el.textContent = c.text
        if (c.width) el.style.width = c.width
        if (c.height) el.style.height = c.height
        if (c.imageSrc) (el as HTMLImageElement).src = c.imageSrc
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
    if (!on) { setHovBox(null); setSelBox(null); setDropTarget(null); return }

    const onMove = (e: MouseEvent) => {
      if (resizeRef.current) { moveResize(e); return }
      if (dragging.current) { moveDrag(e); return }
      let el = e.target as HTMLElement
      if (isUI(el) || el === document.body || !el) { setHovBox(null); return }
      // Climb to hover-image container for better outline
      const hoverAncestor = el.closest<HTMLElement>('[data-hover-image-id]')
      if (hoverAncestor) el = hoverAncestor
      setHovBox(toRect(el))
    }

    const onDown = (e: MouseEvent) => {
      if (isUI(e.target as HTMLElement)) return
      let target = e.target as HTMLElement
      if (!target || target === document.body || isFormEl(target)) return

      // Climb to hover-image container so the whole frame is selected/dragged
      const hoverAncestor = target.closest<HTMLElement>('[data-hover-image-id]')
      if (hoverAncestor) target = hoverAncestor

      // If clicking an <img> that fills its container (cover layout), select parent
      if (target.tagName === 'IMG' && !hoverAncestor) {
        const img = target as HTMLImageElement
        const cs  = window.getComputedStyle(img)
        const parentCs = img.parentElement ? window.getComputedStyle(img.parentElement) : null
        const coversParent = cs.width === '100%' || cs.position === 'absolute'
        if (coversParent && img.parentElement && parentCs?.overflow === 'hidden') {
          target = img.parentElement
        }
      }

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
      setIsImg(target.tagName === 'IMG')
    }

    const onUp   = (e: MouseEvent) => {
      if (resizeRef.current) { endResize(e); return }
      if (dragging.current) endDrag(e)
    }
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

  // ── Image drag-and-drop listeners ─────────────────────────────────────────
  useEffect(() => {
    if (!on) return

    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return
      e.preventDefault()
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const imgEl = el instanceof HTMLImageElement
        ? el
        : el instanceof HTMLElement
          ? el.querySelector('img') ?? null
          : null
      if (imgEl) {
        setDropTarget({ rect: toRect(imgEl) })
      } else {
        setDropTarget(null)
      }
    }

    const onDragLeave = () => setDropTarget(null)

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setDropTarget(null)
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return
      const file = files[0]
      if (!file.type.startsWith('image/')) return
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const imgEl = el instanceof HTMLImageElement
        ? el
        : el instanceof HTMLElement
          ? el.querySelector('img') ?? null
          : null
      if (imgEl) replaceImage(imgEl, file)
    }

    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [on]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────
  function doDeselect() {
    if (selEl.current && editing.current) doEndEdit(selEl.current)
    selEl.current = undefined
    setSelBox(null)
    setIsText(false)
    setIsImg(false)
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

  function startResize(e: React.MouseEvent<HTMLDivElement>, dir: ResizeDir) {
    e.stopPropagation()
    const el = selEl.current
    if (!el) return
    const [origDx, origDy] = getTx(el)
    const rect = el.getBoundingClientRect()
    const origW = parseFloat(el.style.width) || rect.width
    const origH = parseFloat(el.style.height) || rect.height
    const s = mkSel(el)
    history.current.push({
      type: 'resize',
      selector: s,
      prevW: el.style.width || `${Math.round(rect.width)}px`,
      prevH: el.style.height || `${Math.round(rect.height)}px`,
    })
    setHistLen(history.current.length)
    resizeRef.current = { el, dir, mx: e.clientX, my: e.clientY, origW, origH, origDx, origDy }
  }

  function moveResize(e: MouseEvent) {
    const r = resizeRef.current
    if (!r) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const ddx = e.clientX - r.mx
      const ddy = e.clientY - r.my
      let newW = r.origW, newH = r.origH, newDx = r.origDx, newDy = r.origDy

      if (r.dir.includes('e')) newW = Math.max(20, r.origW + ddx)
      if (r.dir.includes('w')) {
        newW = Math.max(20, r.origW - ddx)
        newDx = r.origDx + (r.origW - newW)
      }
      if (r.dir.includes('s')) newH = Math.max(20, r.origH + ddy)
      if (r.dir.includes('n')) {
        newH = Math.max(20, r.origH - ddy)
        newDy = r.origDy + (r.origH - newH)
      }

      r.el.style.width  = `${Math.round(newW)}px`
      r.el.style.height = `${Math.round(newH)}px`
      setTx(r.el, newDx, newDy)
      setSelBox(toRect(r.el))
    })
  }

  function endResize(e: MouseEvent) {
    const r = resizeRef.current
    if (!r) return
    // Final resize application
    const ddx = e.clientX - r.mx
    const ddy = e.clientY - r.my
    let newW = r.origW, newH = r.origH, newDx = r.origDx, newDy = r.origDy

    if (r.dir.includes('e')) newW = Math.max(20, r.origW + ddx)
    if (r.dir.includes('w')) {
      newW = Math.max(20, r.origW - ddx)
      newDx = r.origDx + (r.origW - newW)
    }
    if (r.dir.includes('s')) newH = Math.max(20, r.origH + ddy)
    if (r.dir.includes('n')) {
      newH = Math.max(20, r.origH - ddy)
      newDy = r.origDy + (r.origH - newH)
    }

    r.el.style.width  = `${Math.round(newW)}px`
    r.el.style.height = `${Math.round(newH)}px`
    setTx(r.el, newDx, newDy)

    const s = mkSel(r.el)
    const ex = changes.current.get(s) ?? { selector: s, dx: 0, dy: 0 }
    changes.current.set(s, {
      ...ex,
      dx: newDx, dy: newDy,
      width: `${Math.round(newW)}px`,
      height: `${Math.round(newH)}px`,
    })
    setSelBox(toRect(r.el))
    resizeRef.current = undefined
  }

  function startEdit(el: HTMLElement) {
    if (editing.current) return
    history.current.push({ type: 'text', selector: mkSel(el), prevText: el.textContent ?? '' })
    setHistLen(history.current.length)
    selEl.current = el
    editing.current = true
    setIsText(true)
    setIsImg(false)
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

  function replaceImage(imgEl: HTMLImageElement, file: File) {
    const s = mkSel(imgEl)
    const prevSrc = imgEl.src
    history.current.push({ type: 'image', selector: s, prevSrc })
    setHistLen(history.current.length)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      imgEl.src = base64
      const ex = changes.current.get(s) ?? { selector: s, dx: 0, dy: 0 }
      changes.current.set(s, { ...ex, imageSrc: base64 })
    }
    reader.readAsDataURL(file)
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
      } else if (entry.type === 'text') {
        el.textContent = entry.prevText
        const ex = changes.current.get(entry.selector)
        if (ex) changes.current.set(entry.selector, { ...ex, text: entry.prevText })
      } else if (entry.type === 'resize') {
        el.style.width = entry.prevW
        el.style.height = entry.prevH
        const ex = changes.current.get(entry.selector)
        if (ex) changes.current.set(entry.selector, { ...ex, width: entry.prevW, height: entry.prevH })
        if (selEl.current === el) setSelBox(toRect(el))
      } else if (entry.type === 'image') {
        ;(el as HTMLImageElement).src = entry.prevSrc
        const ex = changes.current.get(entry.selector)
        if (ex) changes.current.set(entry.selector, { ...ex, imageSrc: entry.prevSrc })
      }
    } catch {}
  }

  function openContentDrawer() {
    // Scan all visible text elements and collect them
    const QUERY = 'h1,h2,h3,h4,h5,h6,p,li,span,a,button,label'
    const blocks: { sel: string; tag: string; text: string }[] = []
    const seen = new Set<string>()
    document.querySelectorAll<HTMLElement>(QUERY).forEach(el => {
      if (isUI(el)) return
      const text = el.textContent?.trim() ?? ''
      if (!text || text.length < 2) return
      // Skip elements whose text is entirely from children
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent?.trim() ?? '')
        .join('').trim()
      if (!directText && el.children.length > 0) return
      const sel = mkSel(el)
      if (seen.has(sel)) return
      seen.add(sel)
      blocks.push({ sel, tag: el.tagName.toLowerCase(), text })
    })
    setContentBlocks(blocks)
    setContentOpen(true)
  }

  function applyContentEdit(sel: string, newText: string) {
    try {
      const el = document.querySelector<HTMLElement>(sel)
      if (!el) return
      history.current.push({ type: 'text', selector: sel, prevText: el.textContent ?? '' })
      setHistLen(history.current.length)
      el.textContent = newText
      const ex = changes.current.get(sel) ?? { selector: sel, dx: 0, dy: 0 }
      changes.current.set(sel, { ...ex, text: newText })
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

  return (
    <>
      {/* Hover outline */}
      {hovBox && !dragging.current && !resizeRef.current && (
        <div data-dev-ui style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9990,
          left: hovBox.x - 1, top: hovBox.y - 1,
          width: hovBox.w + 2, height: hovBox.h + 2,
          border: '1px solid rgba(200,75,47,0.35)',
          borderRadius: 2, boxSizing: 'border-box',
        }} />
      )}

      {/* Selection box + tooltip */}
      {selBox && (
        <div data-dev-ui style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9991,
          left: selBox.x - 2, top: selBox.y - 2,
          width: selBox.w + 4, height: selBox.h + 4,
          border: `2px solid ${isText ? BLUE : RED}`,
          borderRadius: 2, boxSizing: 'border-box',
        }}>
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

      {/* 8 Resize handles — separate container so they receive pointer events */}
      {selBox && !isText && (
        <div data-dev-ui style={{
          position: 'fixed',
          left: selBox.x - 6, top: selBox.y - 6,
          width: selBox.w + 12, height: selBox.h + 12,
          pointerEvents: 'none',
          zIndex: 9992,
        }}>
          {RESIZE_HANDLES.map(({ dir, style: pos, cursor }) => (
            <div
              key={dir}
              data-dev-ui
              onMouseDown={(e) => startResize(e, dir)}
              style={{
                position: 'absolute',
                width: 8, height: 8,
                background: '#fff',
                border: '2px solid #c84b2f',
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                cursor,
                ...pos,
              }}
            />
          ))}
        </div>
      )}

      {/* Image drop target overlay */}
      {dropTarget && (
        <div data-dev-ui style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9993,
          left: dropTarget.rect.x, top: dropTarget.rect.y,
          width: dropTarget.rect.w, height: dropTarget.rect.h,
          border: '2px dashed #2563eb',
          background: 'rgba(37,99,235,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: BLUE }}>
            DROP IMAGE
          </span>
        </div>
      )}

      {/* Content Editor Drawer */}
      {contentOpen && (
        <div data-dev-ui style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 380, zIndex: 9998,
          background: '#fafaf8',
          borderLeft: '1px solid #e0ddd8',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          fontFamily: MONO,
        }}>
          {/* Drawer header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #e0ddd8',
            background: '#1c1b19',
          }}>
            <span style={{ fontSize: 9, letterSpacing: '0.14em', color: '#ede9e3', textTransform: 'uppercase' }}>
              ✎ Page Content
            </span>
            <button
              data-dev-ui onClick={() => setContentOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b9690', fontSize: 14, lineHeight: 1, padding: 0 }}
            >×</button>
          </div>
          <p style={{ padding: '10px 16px 6px', fontSize: 8, color: '#a8a49e', letterSpacing: '0.06em', margin: 0 }}>
            Edit any field below — changes reflect live on the page
          </p>
          {/* Scrollable blocks */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 16px' }}>
            {contentBlocks.map((block, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 8, color: '#c84b2f', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: 4,
                }}>
                  {block.tag}
                </div>
                <textarea
                  data-dev-ui
                  defaultValue={block.text}
                  rows={Math.min(6, Math.ceil(block.text.length / 48) + 1)}
                  onChange={e => applyContentEdit(block.sel, e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'var(--font-manrope, sans-serif)', fontSize: 12,
                    color: '#1c1b19', lineHeight: 1.6,
                    background: '#fff', border: '1px solid #e0ddd8',
                    borderRadius: 4, padding: '8px 10px',
                    resize: 'vertical', outline: 'none',
                  }}
                  onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#c84b2f' }}
                  onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#e0ddd8' }}
                />
              </div>
            ))}
          </div>
          {/* Drawer footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e0ddd8', display: 'flex', gap: 6 }}>
            <button
              data-dev-ui onClick={doSave}
              style={{
                flex: 1, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em',
                background: saveOk ? '#22c55e' : '#1c1b19', color: '#ede9e3',
                border: 'none', borderRadius: 4, padding: '8px 0', cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {saveOk ? '✓ Saved' : 'Save Changes'}
            </button>
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

      {/* Hidden file input for replace image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        data-dev-ui
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && selEl.current && selEl.current.tagName === 'IMG') {
            replaceImage(selEl.current as HTMLImageElement, file)
          }
          e.target.value = ''
        }}
      />

      {/* Toolbar */}
      <div data-dev-ui style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', gap: 4, alignItems: 'center',
        background: '#1c1b19', padding: '6px 8px', borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* REPLACE IMG button — only shown when an img is selected */}
        {isImg && (
          <button
            data-dev-ui
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontFamily: MONO, letterSpacing: '0.1em',
              background: 'transparent',
              border: '1px solid rgba(37,99,235,0.6)',
              color: '#93c5fd',
              fontSize: 9, padding: '4px 10px', borderRadius: 4,
              cursor: 'pointer', textTransform: 'uppercase',
            }}
          >
            REPLACE IMG
          </button>
        )}

        {/* CONTENT button — opens text editor drawer */}
        <button
          data-dev-ui
          onClick={openContentDrawer}
          style={{
            fontFamily: MONO, letterSpacing: '0.1em',
            background: contentOpen ? 'rgba(200,75,47,0.15)' : 'transparent',
            border: `1px solid ${contentOpen ? RED : 'rgba(237,233,227,0.25)'}`,
            color: contentOpen ? RED : '#ede9e3',
            fontSize: 9, padding: '4px 10px', borderRadius: 4,
            cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          ✎ CONTENT
        </button>

        {([
          { label: saveOk ? '✓ SAVED' : 'SAVE',           fn: doSave,                              ok: saveOk,    dim: false         },
          { label: histLen ? `UNDO (${histLen})` : 'UNDO', fn: doUndo,                              ok: false,     dim: histLen === 0 },
          { label: 'RESET',                                fn: doReset,                             ok: false,     dim: false         },
          { label: 'EXIT',                                 fn: () => { doDeselect(); setOn(false) }, ok: false,    dim: false         },
        ] as const).map(({ label, fn, ok, dim }) => (
          <button
            key={label}
            data-dev-ui
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
