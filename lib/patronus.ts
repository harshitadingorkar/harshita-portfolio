// ── Types ────────────────────────────────────────────────────────────────────
export type AnimalType =
  | 'rabbit' | 'fox' | 'bird' | 'deer' | 'moth'
  | 'heron'  | 'wolf' | 'wren' | 'bear' | 'finch'
  | 'smoke'  | 'flame'

export interface PatronData {
  id: string
  name: string
  nameA: string
  nameB: string
  animal: AnimalType
  fieldX: number   // normalized 0-1 canvas position
  fieldY: number
  createdAt: number
  isCurrentVisitor?: boolean
}

export type Point = { x: number; y: number }

// ── Seeded RNG ───────────────────────────────────────────────────────────────
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// ── Point helpers ────────────────────────────────────────────────────────────
function oval(cx: number, cy: number, rx: number, ry: number, n: number, r: () => number): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r())
    const nx = (r() - 0.5) * rx * 0.6
    const ny = (r() - 0.5) * ry * 0.6
    pts.push({ x: cx + Math.cos(a) * rx * d + nx, y: cy + Math.sin(a) * ry * d + ny })
  }
  return pts
}

function seg(x1: number, y1: number, x2: number, y2: number, n: number, r: () => number): Point[] {
  const pts: Point[] = []
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1)
    const j = (r() - 0.5) * 0.03
    pts.push({ x: x1 + dx * t + px * j, y: y1 + dy * t + py * j })
  }
  return pts
}

function tri(cx: number, cy: number, size: number, n: number, r: () => number): Point[] {
  const pts: Point[] = []
  const vx = [cx, cx - size * 0.866, cx + size * 0.866]
  const vy = [cy - size, cy + size * 0.5, cy + size * 0.5]
  for (let i = 0; i < n; i++) {
    let u = r(), v = r()
    if (u + v > 1) { u = 1 - u; v = 1 - v }
    const w = 1 - u - v
    pts.push({ x: vx[0]*u + vx[1]*v + vx[2]*w, y: vy[0]*u + vy[1]*v + vy[2]*w })
  }
  return pts
}

// ── Animal silhouettes (each seeded independently) ───────────────────────────
function makeShapes(): Record<AnimalType, Point[]> {
  const r = (seed: number) => mulberry32(seed)
  return {
    rabbit: [
      ...oval(0.50, 0.60, 0.18, 0.22, 40, r(101)),
      ...oval(0.50, 0.32, 0.12, 0.12, 25, r(102)),
      ...oval(0.38, 0.12, 0.05, 0.14, 15, r(103)),
      ...oval(0.62, 0.12, 0.05, 0.14, 15, r(104)),
      ...oval(0.68, 0.72, 0.05, 0.05,  8, r(105)),
    ],
    fox: [
      ...oval(0.45, 0.55, 0.16, 0.20, 35, r(111)),
      ...oval(0.48, 0.30, 0.10, 0.10, 20, r(112)),
      ...tri( 0.38, 0.18, 0.08, 12,       r(113)),
      ...tri( 0.55, 0.18, 0.08, 12,       r(114)),
      ...oval(0.32, 0.24, 0.04, 0.08,  8, r(115)),
      ...oval(0.72, 0.65, 0.12, 0.08, 18, r(116)),
      ...oval(0.82, 0.72, 0.08, 0.10, 12, r(117)),
    ],
    bird: [
      ...oval(0.50, 0.55, 0.14, 0.12, 25, r(121)),
      ...oval(0.50, 0.38, 0.08, 0.08, 15, r(122)),
      ...oval(0.24, 0.45, 0.18, 0.08, 20, r(123)),
      ...oval(0.76, 0.45, 0.18, 0.08, 20, r(124)),
      ...oval(0.50, 0.68, 0.04, 0.10, 10, r(125)),
      ...oval(0.50, 0.30, 0.02, 0.05,  6, r(126)),
    ],
    deer: [
      ...oval(0.50, 0.52, 0.14, 0.20, 30, r(131)),
      ...oval(0.50, 0.28, 0.08, 0.09, 16, r(132)),
      ...seg( 0.35, 0.65, 0.30, 0.88, 10, r(133)),
      ...seg( 0.45, 0.65, 0.42, 0.88, 10, r(134)),
      ...seg( 0.55, 0.65, 0.55, 0.88, 10, r(135)),
      ...seg( 0.65, 0.65, 0.68, 0.88, 10, r(136)),
      ...seg( 0.44, 0.20, 0.34, 0.08,  8, r(137)),
      ...seg( 0.56, 0.20, 0.66, 0.08,  8, r(138)),
    ],
    moth: [
      ...oval(0.50, 0.52, 0.04, 0.18, 12, r(141)),
      ...oval(0.30, 0.42, 0.18, 0.14, 28, r(142)),
      ...oval(0.70, 0.42, 0.18, 0.14, 28, r(143)),
      ...oval(0.34, 0.60, 0.12, 0.10, 16, r(144)),
      ...oval(0.66, 0.60, 0.12, 0.10, 16, r(145)),
      ...seg( 0.46, 0.36, 0.38, 0.24,  6, r(146)),
      ...seg( 0.54, 0.36, 0.62, 0.24,  6, r(147)),
    ],
    heron: [
      ...oval(0.50, 0.45, 0.16, 0.14, 25, r(151)),
      ...seg( 0.48, 0.38, 0.44, 0.18, 12, r(152)),
      ...oval(0.42, 0.14, 0.07, 0.07, 12, r(153)),
      ...seg( 0.38, 0.12, 0.28, 0.10,  5, r(154)),
      ...seg( 0.44, 0.58, 0.38, 0.88, 10, r(155)),
      ...seg( 0.56, 0.58, 0.62, 0.88, 10, r(156)),
      ...oval(0.26, 0.50, 0.10, 0.16, 15, r(157)),
      ...oval(0.74, 0.50, 0.10, 0.16, 15, r(158)),
    ],
    wolf: [
      ...oval(0.48, 0.50, 0.18, 0.18, 35, r(161)),
      ...oval(0.46, 0.28, 0.11, 0.11, 20, r(162)),
      ...tri( 0.38, 0.16, 0.07, 10,       r(163)),
      ...tri( 0.52, 0.16, 0.07, 10,       r(164)),
      ...oval(0.40, 0.24, 0.06, 0.08, 10, r(165)),
      ...seg( 0.62, 0.58, 0.72, 0.82, 12, r(166)),
      ...seg( 0.35, 0.62, 0.28, 0.86,  8, r(167)),
      ...seg( 0.45, 0.62, 0.42, 0.86,  8, r(168)),
    ],
    wren: [
      ...oval(0.50, 0.55, 0.13, 0.11, 22, r(171)),
      ...oval(0.50, 0.38, 0.09, 0.09, 16, r(172)),
      ...seg( 0.56, 0.42, 0.64, 0.36,  5, r(173)),
      ...seg( 0.56, 0.58, 0.68, 0.45,  8, r(174)),
      ...seg( 0.44, 0.66, 0.38, 0.80,  6, r(175)),
      ...seg( 0.56, 0.66, 0.62, 0.80,  6, r(176)),
    ],
    bear: [
      ...oval(0.50, 0.56, 0.24, 0.26, 50, r(181)),
      ...oval(0.50, 0.30, 0.16, 0.15, 30, r(182)),
      ...oval(0.36, 0.18, 0.07, 0.07, 10, r(183)),
      ...oval(0.64, 0.18, 0.07, 0.07, 10, r(184)),
      ...oval(0.34, 0.68, 0.08, 0.12, 12, r(185)),
      ...oval(0.46, 0.72, 0.08, 0.12, 12, r(186)),
      ...oval(0.54, 0.72, 0.08, 0.12, 12, r(187)),
      ...oval(0.66, 0.68, 0.08, 0.12, 12, r(188)),
    ],
    finch: [
      ...oval(0.50, 0.54, 0.12, 0.10, 20, r(191)),
      ...oval(0.50, 0.40, 0.08, 0.08, 14, r(192)),
      ...oval(0.42, 0.38, 0.05, 0.04,  7, r(193)),
      ...seg( 0.44, 0.64, 0.38, 0.76,  5, r(194)),
      ...seg( 0.56, 0.64, 0.62, 0.76,  5, r(195)),
      ...oval(0.28, 0.52, 0.10, 0.06, 12, r(196)),
      ...oval(0.72, 0.52, 0.10, 0.06, 12, r(197)),
    ],
    smoke: [
      ...oval(0.50, 0.80, 0.06, 0.06, 12, r(201)),
      ...oval(0.50, 0.65, 0.09, 0.10, 16, r(202)),
      ...oval(0.48, 0.50, 0.12, 0.12, 18, r(203)),
      ...oval(0.46, 0.35, 0.16, 0.14, 20, r(204)),
      ...oval(0.36, 0.22, 0.12, 0.10, 14, r(205)),
      ...oval(0.58, 0.18, 0.14, 0.09, 14, r(206)),
      ...oval(0.44, 0.10, 0.10, 0.08, 10, r(207)),
    ],
    flame: [
      ...oval(0.50, 0.70, 0.14, 0.12, 22, r(211)),
      ...oval(0.50, 0.54, 0.11, 0.16, 22, r(212)),
      ...oval(0.50, 0.38, 0.08, 0.14, 16, r(213)),
      ...oval(0.50, 0.24, 0.05, 0.10, 10, r(214)),
      ...oval(0.50, 0.14, 0.03, 0.06,  6, r(215)),
    ],
  }
}

export const SHAPES = makeShapes()

// ── Noun → animal mapping ────────────────────────────────────────────────────
const NOUN_MAP: Record<string, AnimalType> = {
  rabbit: 'rabbit',
  fox: 'fox', thorn: 'fox',
  bird: 'bird',
  wren: 'wren', moss: 'wren', acorn: 'wren', pebble: 'wren',
  finch: 'finch', grain: 'finch',
  river: 'smoke', rain: 'smoke', tide: 'smoke', drift: 'smoke',
  echo: 'smoke', current: 'smoke', cloud: 'smoke', dusk: 'smoke', smoke: 'smoke',
  spark: 'flame', ember: 'flame', candle: 'flame', lantern: 'flame',
  bloom: 'moth', fern: 'moth', thistle: 'moth', moth: 'moth',
  stone: 'bear', root: 'bear', marrow: 'bear',
  heron: 'heron', creek: 'heron',
  deer: 'deer', flicker: 'deer',
  shadow: 'wolf', hollow: 'wolf',
}

const ALL_ANIMALS: AnimalType[] = [
  'rabbit','fox','bird','deer','moth','heron','wolf','wren','bear','finch','smoke','flame',
]

// ── Name lists ───────────────────────────────────────────────────────────────
const LIST_A = [
  'silly','quiet','lucky','soft','tiny','wild','slow','hollow',
  'bright','ash','salt','morning','lost','brave','fond','gentle',
  'velvet','stray','amber','still','nimble','foggy','curious',
  'tender','wandering','pale','restless','golden','sleepy',
  'ancient','fleeting','borrowed','tangled','patient','weary',
]

const LIST_B = [
  'rabbit','fox','stone','moth','bird','river','rain','tide',
  'spark','bloom','drift','echo','root','cloud','ember',
  'pebble','wren','fern','finch','creek','smoke','lantern',
  'thistle','current','hollow','flicker','marrow','dusk',
  'heron','grain','thorn','candle','shadow','moss','acorn',
]

// ── Name generation ──────────────────────────────────────────────────────────
export function generatePatronName(patronId: string) {
  const h = hashString(patronId)
  const rng = mulberry32(h)
  const nameA = LIST_A[Math.floor(rng() * LIST_A.length)]
  const nameB = LIST_B[Math.floor(rng() * LIST_B.length)]
  const animal: AnimalType = NOUN_MAP[nameB] ?? ALL_ANIMALS[h % 12]
  return { nameA, nameB, name: nameA + nameB, animal }
}

export function generatePatronId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function generateFieldPosition(patronId: string): { x: number; y: number } {
  const rng = mulberry32(hashString(patronId) ^ 0xdeadbeef)
  return { x: 0.10 + rng() * 0.80, y: 0.10 + rng() * 0.80 }
}

// ── localStorage helpers ─────────────────────────────────────────────────────
const KEY_DATA    = 'patron_data'
const KEY_VISITED = 'patron_visited'
const KEY_LAST    = 'patron_last_visit'

export function getOrCreatePatron(): PatronData {
  if (typeof window === 'undefined') throw new Error('client only')
  const raw = localStorage.getItem(KEY_DATA)
  if (raw) {
    try { return { ...JSON.parse(raw), isCurrentVisitor: true } } catch {}
  }
  const id = generatePatronId()
  const { nameA, nameB, name, animal } = generatePatronName(id)
  const { x, y } = generateFieldPosition(id)
  const patron: PatronData = {
    id, name, nameA, nameB, animal,
    fieldX: x, fieldY: y,
    createdAt: Date.now(),
    isCurrentVisitor: true,
  }
  localStorage.setItem(KEY_DATA, JSON.stringify(patron))
  return patron
}

export function hasVisitedBefore(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(KEY_VISITED)
}

export function markVisited(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_VISITED, '1')
}

export function getLastVisit(): number | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(KEY_LAST)
  return v ? parseInt(v, 10) : null
}

export function setLastVisit(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_LAST, Date.now().toString())
}

// ── Static seeded field patrons (simulate other visitors) ────────────────────
// Real shared storage would require a backend; these stable patrons make the
// field feel inhabited from day one.
export const SEEDED_PATRONS: PatronData[] = [
  { id:'sp1',  name:'quietfox',     nameA:'quiet',    nameB:'fox',     animal:'fox',    fieldX:0.18, fieldY:0.22, createdAt: Date.now()-86400000*45 },
  { id:'sp2',  name:'goldenbird',   nameA:'golden',   nameB:'bird',    animal:'bird',   fieldX:0.72, fieldY:0.17, createdAt: Date.now()-86400000*12 },
  { id:'sp3',  name:'ashriver',     nameA:'ash',      nameB:'river',   animal:'smoke',  fieldX:0.63, fieldY:0.76, createdAt: Date.now()-86400000*3  },
  { id:'sp4',  name:'gentleheron',  nameA:'gentle',   nameB:'heron',   animal:'heron',  fieldX:0.27, fieldY:0.69, createdAt: Date.now()-86400000*180},
  { id:'sp5',  name:'palemoth',     nameA:'pale',     nameB:'moth',    animal:'moth',   fieldX:0.83, fieldY:0.44, createdAt: Date.now()-86400000*7  },
  { id:'sp6',  name:'saltstone',    nameA:'salt',     nameB:'stone',   animal:'bear',   fieldX:0.46, fieldY:0.83, createdAt: Date.now()-86400000*60 },
  { id:'sp7',  name:'wildwren',     nameA:'wild',     nameB:'wren',    animal:'wren',   fieldX:0.13, fieldY:0.56, createdAt: Date.now()-86400000*1  },
  { id:'sp8',  name:'morningspark', nameA:'morning',  nameB:'spark',   animal:'flame',  fieldX:0.88, fieldY:0.31, createdAt: Date.now()-86400000*20 },
  { id:'sp9',  name:'lostdeer',     nameA:'lost',     nameB:'deer',    animal:'deer',   fieldX:0.56, fieldY:0.27, createdAt: Date.now()-86400000*90 },
  { id:'sp10', name:'tenderacorn',  nameA:'tender',   nameB:'acorn',   animal:'wren',   fieldX:0.77, fieldY:0.63, createdAt: Date.now()-86400000*14 },
  { id:'sp11', name:'braverabbit',  nameA:'brave',    nameB:'rabbit',  animal:'rabbit', fieldX:0.34, fieldY:0.14, createdAt: Date.now()-86400000*5  },
  { id:'sp12', name:'softecho',     nameA:'soft',     nameB:'echo',    animal:'smoke',  fieldX:0.91, fieldY:0.78, createdAt: Date.now()-86400000*33 },
]

// ── Time-ago helper ──────────────────────────────────────────────────────────
export function timeAgo(ts: number): string {
  const d = Date.now() - ts
  const mins  = d / 60000
  const hours = d / 3600000
  const days  = d / 86400000
  if (mins  < 60)  return 'today'
  if (hours < 24)  return 'today'
  if (days  < 2)   return 'yesterday'
  if (days  < 7)   return `${Math.floor(days)} days ago`
  if (days  < 60)  return `${Math.floor(days / 7)} weeks ago`
  if (days  < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}
