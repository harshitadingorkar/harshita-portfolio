'use client'

import { forwardRef, useEffect, useRef, Component, type ReactNode } from 'react'

const PROJECT_ID = '68NPqs52HBHIFhXMihRV'
const SDK_URL    = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.3/dist/unicornStudio.umd.js'

// Catch any crash from the third-party scene without killing the page
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

// Loads Unicorn Studio SDK via script tag and mounts the scene imperatively.
// This replaces the unicornstudio-react/next import which fails to resolve
// on Vercel due to package exports field conflicts with webpack.
function UnicornScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const id = `us-${Math.random().toString(36).slice(2, 8)}`
    container.setAttribute('data-us-project', PROJECT_ID)
    container.id = id

    let destroyed = false

    function initScene() {
      if (destroyed) return
      const US = (window as unknown as Record<string, unknown>).UnicornStudio as {
        isInitialized?: boolean
        init?: () => void
      } | undefined
      if (!US) return
      if (!US.isInitialized) US.init?.()
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`)
    if (existing) {
      initScene()
    } else {
      const script = document.createElement('script')
      script.src = SDK_URL
      script.onload = initScene
      document.head.appendChild(script)
    }

    return () => {
      destroyed = true
      const US = (window as unknown as Record<string, unknown>).UnicornStudio as {
        destroyScene?: (id: string) => void
      } | undefined
      US?.destroyScene?.(id)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

const UnicornHero = forwardRef<HTMLDivElement, { style?: React.CSSProperties; onReady?: () => void }>(
function UnicornHero({ style, onReady }, ref) {

  useEffect(() => {
    const t = setTimeout(() => onReady?.(), 800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <SceneBoundary>
        <UnicornScene />
      </SceneBoundary>
    </div>
  )
})

UnicornHero.displayName = 'UnicornHero'
export default UnicornHero
