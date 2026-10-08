import { PHASES, phaseOf } from '../data/constants'
import type { Doc, Episode, PhaseId } from '../types'
import type { EnredoState } from '../store'
import { docBlocks, docGaps } from './doc'
import { ago, epNum, plural } from './format'

/** Fase "atual" da história: a do primeiro episódio que não foi descartado. */
export function seriePhase(episodes: Episode[], serieId: string): PhaseId {
  const eps = episodes.filter((e) => e.serieId === serieId && e.status !== 'cut').sort((a, b) => a.num - b.num)
  return eps[0]?.phase ?? 'brainstorm'
}

export const serieEpisodes = (s: EnredoState, serieId: string) =>
  s.episodes.filter((e) => e.serieId === serieId).sort((a, b) => a.num - b.num)

export const isLocked = (d: Doc, now = Date.now()) => (d.lockedUntil ?? 0) > now

export function docMeta(d: Doc, now = Date.now()) {
  if (isLocked(d, now)) return 'trancado'
  const blocks = docBlocks(d.content)
  const scenes = blocks.filter((b) => b.type === 'scene').length
  const words = blocks.reduce((n, b) => n + (b.text.match(/\S+/g)?.length ?? 0), 0)
  const size = scenes ? plural(scenes, 'cena', 'cenas') : words ? plural(words, 'palavra', 'palavras') : 'vazio'
  return `${size} · mexido ${ago(d.updatedAt, now)}`
}

/** "A Casa Vazia · ep. 01 · Vomit draft" */
export function docPlace(s: EnredoState, d: Doc) {
  const e = s.episodes.find((x) => x.id === d.episodeId)
  const serie = e && s.series.find((x) => x.id === e.serieId)
  if (!e || !serie) return 'sem vínculo'
  return `${serie.title} · ep. ${epNum(e.num)} · ${phaseOf(d.phase).title}`
}

/** Opções de "Ligar": todo episódio × toda fase. */
export function linkOptions(s: EnredoState) {
  return s.series.flatMap((serie) =>
    serieEpisodes(s, serie.id).flatMap((e) =>
      PHASES.map((p) => ({ episodeId: e.id, phase: p.id, color: p.color, label: `${serie.title} · ep. ${epNum(e.num)} · ${p.title}` })),
    ),
  )
}

/** Imagem do personagem de uma fase: override da história, senão o padrão da fase. */
export function phaseArtUrl(s: EnredoState, phase: PhaseId, serieId?: string) {
  const id = (serieId && s.phaseArt[`${serieId}:${phase}`]) || s.phaseArt[phase]
  return id ? s.imageUrls[id] : undefined
}

export interface ScopeGap {
  text: string
  stage: number
  index: number // posição do buraco dentro do texto
  doc: Doc
  ep: Episode
}

/** Buracos de todos os textos da história (ou só de um episódio). */
export function scopeGaps(docs: Doc[], episodes: Episode[], serieId: string, epId?: string): ScopeGap[] {
  const out: ScopeGap[] = []
  for (const d of docs) {
    const ep = episodes.find((e) => e.id === d.episodeId)
    if (!ep || ep.serieId !== serieId || (epId && ep.id !== epId)) continue
    docGaps(d.content).forEach((g) => out.push({ ...g, doc: d, ep }))
  }
  return out
}
