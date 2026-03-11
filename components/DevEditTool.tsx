'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ImagePosition {
  id: string
  left: string
  top: string
}

interface StoredPositions {
  [id: string]: { left: string; top: string }
}

interface StoredText {
  [key: string]: string
}

interface DragState {
  id: string
  startMouseX: number
  startMouseY: number
  startLeft: number
  startTop: number
  el: HTMLElement
}

// ── Storage helpers ────────────────────────────────────────────────────────────

const POSITIONS_KEY = 'dev_image_positions'
const TEXT_KEY      = 'dev_text_content'

function loadPositions(): StoredPositions {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY)
    return raw ? (JSON.parse(raw) as StoredPositions) : {}
  } catch {
    return {}
  }
}

function savePositions(pos: StoredPositions): void {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(pos))
}

function loadText(): StoredText {
  try {
    const raw = localStorage.getItem(TEXT_KEY)
    return raw ? (JSON.parse(raw) as StoredText) : {}
  } catch {
    return {}
  }
}

function saveText(text: StoredText): void {
  localStorage.setItem(TEXT_KEY, JSON.stringify(text))
}

// ── Drag helpers ───────────────────────────────────────────────────────────────

/**
 * Parse a CSS left/top value (px or calc) into a pixel number relative to viewport.
 * For calc expressions we resolve against the actual rendered position.
 */
function resolvePixel(val: string, el: HTMLElement, axis: 'left' | 'top'): number {
  const rect = el.getBoundingClientRect()
  return axis === 'left' ? rect.left : rect.top
}

function toPxString(val: number): string {
  return `${Math.round(val)}px`
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DevEditTool() {
  const [editMode, setEditMode] = useState(false)
  const [positions, setPositions] = useState<StoredPositions>({})
  const dragRef = useRef<DragState | null>(null)
  const [, forceUpdate] = useState(0)

  // ── Keyboard shortcut ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const modKey = e.metaKey || e.ctrlKey
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setEditMode(prev => !prev)
      }
      if (e.key === 'Escape') {
        setEditMode(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Load persisted positions on mount ────────────────────────────────────────
  useEffect(() => {
    setPositions(loadPositions())
  }, [])

  // ── Activate / deactivate edit mode on DOM ───────────────────────────────────
  useEffect(() => {
    if (editMode) {
      activateImageDragging()
      activateTextEditing()
    } else {
      deactivateImageDragging()
      deactivateTextEditing()
    }
    return () => {
      deactivateImageDragging()
      deactivateTextEditing()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode])

  // ── Image dragging ────────────────────────────────────────────────────────────

  function activateImageDragging() {
    const containers = document.querySelectorAll<HTMLElement>('[data-hover-image-id]')
    containers.forEach(el => {
      el.style.cursor = 'grab'
      el.style.pointerEvents = 'all'
      el.style.outline = '1px dashed #c84b2f'
      el.style.outlineOffset = '2px'
      attachPositionReadout(el)
      el.addEventListener('mousedown', onImageMouseDown)
    })
  }

  function deactivateImageDragging() {
    const containers = document.querySelectorAll<HTMLElement>('[data-hover-image-id]')
    containers.forEach(el => {
      el.style.cursor = ''
      el.style.outline = ''
      el.style.outlineOffset = ''
      removePositionReadout(el)
      el.removeEventListener('mousedown', onImageMouseDown)
    })
  }

  function attachPositionReadout(el: HTMLElement) {
    if (el.querySelector('[data-dev-readout]')) return
    const readout = document.createElement('div')
    readout.setAttribute('data-dev-readout', 'true')
    readout.style.cssText = [
      'position:absolute',
      'top:-18px',
      'left:0',
      'font-family:var(--font-ibm-plex-mono,monospace)',
      'font-size:8px',
      'color:#c84b2f',
      'background:rgba(28,27,25,0.85)',
      'padding:2px 5px',
      'border-radius:2px',
      'white-space:nowrap',
      'pointer-events:none',
      'z-index:10000',
    ].join(';')
    updateReadout(readout, el)
    el.style.position = el.style.position || 'absolute'
    el.style.overflow = 'visible'
    el.appendChild(readout)
  }

  function updateReadout(readout: Element, el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    readout.textContent = `x: ${Math.round(rect.left)}px, y: ${Math.round(rect.top)}px`
  }

  function removePositionReadout(el: HTMLElement) {
    const readout = el.querySelector('[data-dev-readout]')
    if (readout) readout.remove()
  }

  const onImageMouseDown = useCallback((e: Event) => {
    const mouseEvent = e as MouseEvent
    const el = mouseEvent.currentTarget as HTMLElement
    mouseEvent.preventDefault()
    el.style.cursor = 'grabbing'

    const rect = el.getBoundingClientRect()
    dragRef.current = {
      id: el.getAttribute('data-hover-image-id') ?? '',
      startMouseX: mouseEvent.clientX,
      startMouseY: mouseEvent.clientY,
      startLeft: rect.left,
      startTop:  rect.top,
      el,
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function onMouseMove(e: MouseEvent) {
    const drag = dragRef.current
    if (!drag) return

    const dx = e.clientX - drag.startMouseX
    const dy = e.clientY - drag.startMouseY
    const newLeft = drag.startLeft + dx
    const newTop  = drag.startTop  + dy

    drag.el.style.left = toPxString(newLeft)
    drag.el.style.top  = toPxString(newTop)

    const readout = drag.el.querySelector('[data-dev-readout]')
    if (readout) {
      readout.textContent = `x: ${Math.round(newLeft)}px, y: ${Math.round(newTop)}px`
    }
  }

  function onMouseUp(e: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup',   onMouseUp)

    const drag = dragRef.current
    if (!drag) return

    drag.el.style.cursor = 'grab'

    const dx = e.clientX - drag.startMouseX
    const dy = e.clientY - drag.startMouseY
    const newLeft = drag.startLeft + dx
    const newTop  = drag.startTop  + dy

    const leftStr = toPxString(newLeft)
    const topStr  = toPxString(newTop)

    const updated: StoredPositions = { ...loadPositions(), [drag.id]: { left: leftStr, top: topStr } }
    savePositions(updated)
    setPositions(updated)

    console.log(
      `// HoverImages position update\n${JSON.stringify({ id: drag.id, left: leftStr, top: topStr }, null, 2)}`
    )

    dragRef.current = null
    forceUpdate(n => n + 1)
  }

  // ── Text editing ──────────────────────────────────────────────────────────────

  function activateTextEditing() {
    const els = document.querySelectorAll<HTMLElement>('[data-editable]')
    els.forEach(el => {
      el.contentEditable = 'true'
      el.style.backgroundColor = 'rgba(255,233,0,0.15)'
      el.style.outline = 'none'
      el.style.cursor = 'text'
      el.addEventListener('blur', onTextBlur)

      // Pre-fill from localStorage
      const key = el.getAttribute('data-editable') ?? ''
      const stored = loadText()
      if (stored[key] !== undefined) {
        el.textContent = stored[key]
      }
    })
  }

  function deactivateTextEditing() {
    const els = document.querySelectorAll<HTMLElement>('[data-editable]')
    els.forEach(el => {
      el.contentEditable = 'false'
      el.style.backgroundColor = ''
      el.style.cursor = ''
      el.removeEventListener('blur', onTextBlur)
    })
  }

  function onTextBlur(e: Event) {
    const el = e.target as HTMLElement
    const key = el.getAttribute('data-editable') ?? ''
    const value = el.textContent ?? ''

    const stored = loadText()
    stored[key] = value
    saveText(stored)

    console.log(
      `// Text update\n${JSON.stringify({ selector: `[data-editable="${key}"]`, value }, null, 2)}`
    )
  }

  // ── Config export ─────────────────────────────────────────────────────────────

  function handleCopyConfig() {
    const pos   = loadPositions()
    const text  = loadText()
    const config = { imagePositions: pos, textContent: text }
    const output = `const DEV_CONFIG = ${JSON.stringify(config, null, 2)}`
    navigator.clipboard.writeText(output).then(() => {
      console.log('// DevEditTool config copied to clipboard')
    })
  }

  function handleClear() {
    localStorage.removeItem(POSITIONS_KEY)
    localStorage.removeItem(TEXT_KEY)
    window.location.reload()
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (!editMode) return null

  const monoFont: React.CSSProperties = {
    fontFamily: 'var(--font-ibm-plex-mono, monospace)',
    letterSpacing: '0.05em',
  }

  return (
    <>
      {/* Dim overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.03)',
          pointerEvents: 'none',
          zIndex: 9990,
        }}
      />

      {/* Edit mode badge */}
      <div
        style={{
          ...monoFont,
          position: 'fixed',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          fontSize: '9px',
          fontWeight: 400,
          textTransform: 'uppercase',
          color: '#c84b2f',
          background: 'rgba(28,27,25,0.9)',
          padding: '4px 10px',
          borderRadius: '3px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        ● EDIT MODE
      </div>

      {/* Floating toolbar */}
      <div
        style={{
          ...monoFont,
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          background: '#1c1b19',
          color: '#ede9e3',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '9px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
      >
        {[
          { label: '[COPY CONFIG]', onClick: handleCopyConfig },
          { label: '[CLEAR]',       onClick: handleClear      },
          { label: '[EXIT]',        onClick: () => setEditMode(false) },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              ...monoFont,
              background: 'transparent',
              border: '1px solid rgba(237,233,227,0.2)',
              color: '#ede9e3',
              fontSize: '9px',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#c84b2f'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#c84b2f'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(237,233,227,0.2)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#ede9e3'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
