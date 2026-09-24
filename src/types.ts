export type PhaseId = 'brainstorm' | 'plan' | 'vomit' | 'maturacao' | 'segunda' | 'refino' | 'pronto'
export type StatusId = 'canon' | 'temp' | 'idea' | 'cut'
export type SerieKind = 'Série' | 'Longa' | 'Curta'
export type BlockType = 'scene' | 'action' | 'character' | 'paren' | 'dialog' | 'transition' | 'note' | 'gap'
export type BoardId = 'anatomia' | 'jornada' | 'propp' | 'timeline' | 'atos' | 'escaleta' | 'fichas' | 'postits'

export interface Serie {
  id: string
  title: string
  kind: SerieKind
  coverId?: string // id em `images`
  createdAt: number
  updatedAt: number
}

export interface Arc {
  id: string
  serieId: string
  title: string
  color: string
}

export interface Episode {
  id: string
  serieId: string
  num: number
  title: string
  logline: string
  phase: PhaseId
  status: StatusId
  arcId?: string
  func: string
  createdAt: number
}

/** Nó ProseMirror/TipTap serializado (o documento é guardado como JSON). */
export interface PMNode {
  type: string
  attrs?: Record<string, unknown>
  content?: PMNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

export interface Doc {
  id: string
  episodeId: string
  phase: PhaseId
  title: string
  format: string
  content: PMNode // { type: 'doc', content: [...] }
  lockedUntil?: number
  /** Quando foi mandado maturar (para a barra de progresso). */
  lockedAt?: number
  /** Já avisou que destrancou. */
  unlockNotified?: boolean
  createdAt: number
  updatedAt: number
}

export interface Idea {
  id: string
  serieId: string
  kind: string
  text: string
  color: string
  rot: number
  pinned: boolean
  createdAt: number
}

export type LinkTarget =
  | { kind: 'note'; k: string; id: string }
  | { kind: 'stage'; s: string; i: number }
  | { kind: 'beat'; k: string; i: number }
  | { kind: 'episode'; id: string }
  | { kind: 'idea'; s: string; id: string }

export interface WallNote {
  id: string
  x: number
  y: number
  w: number
  h: number
  color: string
  text: string
}
export interface WallGroup {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  color: string
}
export interface WallStroke {
  d: string
  color: string
}
export interface Wall {
  vx: number
  vy: number
  scale: number
  strokes: WallStroke[]
  groups: WallGroup[]
  notes: WallNote[]
}

export interface StcCard {
  id: string
  row: number
  title: string
  text: string
  emo: string
  conflict: string
  story: 'A' | 'B' | 'C'
  beat: string
}

export interface Plan {
  key: string // serieId ou 'ep:' + episodeId
  premissa: string
  pergunta: string
  principio: string
  formato?: string
  previstos?: number
  boards: BoardId[]
  anatomia: Record<string, string>
  journeyNotes: Record<number, string>
  propp: Record<number, boolean>
  tension: Record<string, number>
  atos: Record<number, { note: string; ep?: string }>
  escaleta: { id: string; heading: string; text: string }[]
  stc: StcCard[]
  wall: Wall
}

export interface StoredImage {
  id: string
  blob: Blob
}

/** Arte padrão por fase (key = phaseId) ou override por história (key = serieId + ':' + phaseId). */
export interface PhaseArt {
  key: string
  imageId: string
}
