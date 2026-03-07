'use client'

import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────
type NodeId =
  | 'harshita' | 'ai_ml' | 'ux_research' | 'research' | 'systems'
  | 'influence' | 'ai_email' | 'github' | 'sony'
  | 'theatre' | 'photography'

interface GraphNode {
  id: NodeId
  x: number
  y: number
  shape: 'starburst' | 'hexagon' | 'square' | 'triangle'
  label: string[]
  sublabel?: string
  number?: number
  route?: string
  faded?: boolean
  isCenter?: boolean
}

interface GraphEdge {
  from: NodeId
  to: NodeId
  dashed?: boolean
}

// ── Data ──────────────────────────────────────────────────────────────────
const NODES: GraphNode[] = [
  {
    id: 'harshita', x: 415, y: 290,
    shape: 'starburst',
    label: ['Harshita Shyale'],
    sublabel: 'Product Designer',
    isCenter: true,
  },
  { id: 'ai_ml',       x: 250, y: 195, shape: 'hexagon', label: ['AI & ML'],     number: 3 },
  { id: 'ux_research', x: 575, y: 182, shape: 'hexagon', label: ['UX Research'], number: 2 },
  { id: 'research',    x: 252, y: 392, shape: 'hexagon', label: ['Research'],    number: 1 },
  { id: 'systems',     x: 568, y: 405, shape: 'hexagon', label: ['Systems'],     number: 4 },

  { id: 'influence', x: 88,  y: 108, shape: 'square', label: ['Influence', 'Graph'],         route: '/work/influence-graph' },
  { id: 'ai_email',  x: 355, y: 62,  shape: 'square', label: ['AI Email', 'Assistant'],      route: '/work/ai-email-assistant' },
  { id: 'github',    x: 710, y: 92,  shape: 'square', label: ['GitHub'],                     route: '/work/github' },
  { id: 'sony',      x: 724, y: 318, shape: 'square', label: ['Sony'],                       route: '/work/sony' },

  { id: 'theatre',     x: 595, y: 62,  shape: 'triangle', label: ['Theatre'],     faded: true },
  { id: 'photography', x: 86,  y: 492, shape: 'square',   label: ['Photography'], faded: true },
]

const EDGES: GraphEdge[] = [
  { from: 'harshita',    to: 'ai_ml' },
  { from: 'harshita',    to: 'ux_research' },
  { from: 'harshita',    to: 'research' },
  { from: 'harshita',    to: 'systems' },
  { from: 'ai_ml',       to: 'influence' },
  { from: 'ai_ml',       to: 'ai_email' },
  { from: 'ux_research', to: 'github' },
  { from: 'ux_research', to: 'sony' },
  { from: 'ux_research', to: 'theatre', dashed: true },
  { from: 'research',    to: 'photography', dashed: true },
]

// ── Shape components ──────────────────────────────────────────────────────
function Starburst({ cx, cy, outerR, innerR }: { cx: number; cy: number; outerR: number; innerR: number }) {
  const pts = 8
  const points = Array.from({ length: pts * 2 }, (_, i) => {
    const angle = (i * Math.PI) / pts - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  })
  return <polygon points={points.join(' ')} fill="var(--accent)" strokeWidth="0" />
}

function Hexagon({ cx, cy, r, active }: { cx: number; cy: number; r: number; active: boolean }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 6
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  })
  return (
    <polygon
      points={points.join(' ')}
      fill={active ? 'var(--ink)' : 'var(--bg)'}
      stroke="var(--ink)"
      strokeWidth="0.9"
      style={{ transition: 'fill 0.15s ease' }}
    />
  )
}

function Square({ cx, cy, s, active }: { cx: number; cy: number; s: number; active: boolean }) {
  return (
    <rect
      x={cx - s / 2} y={cy - s / 2}
      width={s} height={s}
      fill={active ? 'var(--ink)' : 'var(--bg)'}
      stroke="var(--ink)"
      strokeWidth="0.9"
      style={{ transition: 'fill 0.15s ease' }}
    />
  )
}

function Triangle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = [0, 1, 2].map(i => {
    const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  })
  return (
    <polygon points={points.join(' ')} fill="var(--bg)" stroke="var(--ink)" strokeWidth="0.9" />
  )
}

// ── Node element ──────────────────────────────────────────────────────────
function NodeEl({
  node,
  isActive,
  dimmed,
  onEnter,
  onLeave,
  onClick,
}: {
  node: GraphNode
  isActive: boolean
  dimmed: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}) {
  const { x, y, shape, label, sublabel, number, faded, isCenter, route } = node
  const opacity = faded ? (dimmed ? 0.12 : 0.3) : dimmed ? 0.15 : 1
  const isClickable = !!route

  // label offset below shape
  const labelY = shape === 'starburst' ? y + 24 : shape === 'hexagon' ? y + 22 : y + 20

  return (
    <g
      opacity={opacity}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: isClickable ? 'pointer' : 'default', transition: 'opacity 0.18s ease' }}
    >
      {/* Hit area */}
      <circle cx={x} cy={y} r={30} fill="transparent" />

      {/* Shape */}
      {shape === 'starburst' && <Starburst cx={x} cy={y} outerR={13} innerR={5} />}
      {shape === 'hexagon' && (
        <>
          <Hexagon cx={x} cy={y} r={13} active={isActive} />
          {number !== undefined && (
            <text
              x={x} y={y + 3.5}
              textAnchor="middle"
              fontSize="8.5"
              fill={isActive ? 'var(--bg)' : 'var(--ink)'}
              fontFamily="var(--font-ibm-plex-mono)"
              style={{ pointerEvents: 'none', transition: 'fill 0.15s ease' }}
            >
              {number}
            </text>
          )}
        </>
      )}
      {shape === 'square' && <Square cx={x} cy={y} s={16} active={isActive} />}
      {shape === 'triangle' && <Triangle cx={x} cy={y} r={12} />}

      {/* Label lines */}
      {label.map((line, i) => (
        <text
          key={i}
          x={x}
          y={labelY + i * 13}
          textAnchor="middle"
          fontSize="10"
          fill="var(--ink)"
          fontFamily="var(--font-ibm-plex-mono)"
          style={{ pointerEvents: 'none' }}
        >
          {line}
        </text>
      ))}

      {sublabel && (
        <text
          x={x}
          y={labelY + label.length * 13}
          textAnchor="middle"
          fontSize="8.5"
          fill="var(--ink-faint)"
          fontFamily="var(--font-ibm-plex-mono)"
          style={{ pointerEvents: 'none' }}
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export default function NodeGraph({
  activeNodeId,
  onNodeEnter,
  onNodeLeave,
}: {
  activeNodeId: string | null
  onNodeEnter: (id: string) => void
  onNodeLeave: () => void
}) {
  const router = useRouter()

  const nodeMap = new Map(NODES.map(n => [n.id, n]))

  const relatedIds = new Set<string>()
  if (activeNodeId) {
    relatedIds.add(activeNodeId)
    EDGES.forEach(e => {
      if (e.from === activeNodeId) relatedIds.add(e.to)
      if (e.to === activeNodeId) relatedIds.add(e.from)
    })
  }
  const hasFocus = activeNodeId !== null

  return (
    <svg
      viewBox="0 0 820 560"
      width="100%"
      height="100%"
      style={{ display: 'block', userSelect: 'none' }}
    >
      {/* Edges */}
      {EDGES.map(edge => {
        const from = nodeMap.get(edge.from)!
        const to = nodeMap.get(edge.to)!
        const isRelated =
          hasFocus && (edge.from === activeNodeId || edge.to === activeNodeId)
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x} y1={from.y}
            x2={to.x}   y2={to.y}
            stroke="var(--ink)"
            strokeWidth={isRelated ? '0.9' : '0.65'}
            strokeDasharray={edge.dashed ? '4,4' : undefined}
            opacity={hasFocus ? (isRelated ? 0.5 : 0.1) : 0.3}
            style={{ transition: 'opacity 0.18s ease' }}
          />
        )
      })}

      {/* Nodes */}
      {NODES.map(node => {
        const isActive = activeNodeId === node.id
        const dimmed = hasFocus && !relatedIds.has(node.id)
        return (
          <NodeEl
            key={node.id}
            node={node}
            isActive={isActive}
            dimmed={dimmed}
            onEnter={() => onNodeEnter(node.id)}
            onLeave={onNodeLeave}
            onClick={() => { if (node.route) router.push(node.route) }}
          />
        )
      })}
    </svg>
  )
}
