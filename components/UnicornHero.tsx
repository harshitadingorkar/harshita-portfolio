'use client'

import { forwardRef, useEffect, Component, type ReactNode } from 'react'
import UnicornScene from 'unicornstudio-react/next'

const PROJECT_ID = '68NPqs52HBHIFhXMihRV'
const SDK_URL    = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.3/dist/unicornStudio.umd.js'

// Catch any crash from the third-party scene without killing the page
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

const UnicornHero = forwardRef<HTMLDivElement, { style?: React.CSSProperties; onReady?: () => void }>(
function UnicornHero({ style, onReady }, ref) {

  // Fire ready after 800 ms — short enough to not feel blocked
  useEffect(() => {
    const t = setTimeout(() => onReady?.(), 800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <SceneBoundary>
        <UnicornScene
          projectId={PROJECT_ID}
          sdkUrl={SDK_URL}
          width="100%"
          height="100%"
        />
      </SceneBoundary>
    </div>
  )
})

UnicornHero.displayName = 'UnicornHero'
export default UnicornHero
