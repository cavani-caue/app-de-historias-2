import { ATOS, JOURNEY } from '../data/constants'
import type { EnredoState } from '../store'
import type { BoardId, Episode, LinkTarget, Serie } from '../types'
import { epNum, pad2 } from './format'
import { serieEpisodes } from './selectors'

export interface LinkOption {
  group: string
  color: string
  label: string // texto na lista
  chip: string // rótulo do chip no texto
  search: string // texto completo para a busca
  target: LinkTarget
}

const short = (t: string) => {
  t = (t || '').trim() || 'vazio'
  return t.length > 38 ? t.slice(0, 38) + '…' : t
}

export const LINK_KIND: Record<LinkTarget['kind'], string> = {
  note: 'Post-it',
  stage: 'Jornada do herói',
  beat: 'Linha do tempo · 3 atos',
  episode: 'Episódio',
  idea: 'Ideia',
}

/** Tudo que um texto pode ligar: post-its (história e episódio), jornada, 3 atos, episódios e ideias. */
export function linkOptions(s: EnredoState, serie: Serie, ep?: Episode): LinkOption[] {
  const out: LinkOption[] = []
  const notes = (k: string, group: string) =>
    (s.plans[k]?.wall.notes ?? []).forEach((n) => {
      const label = 'post-it: ' + short(n.text)
      out.push({ group, color: n.color, label, chip: label, search: n.text, target: { kind: 'note', k, id: n.id } })
    })
  notes(serie.id, 'Post-its da história')
  if (ep) notes('ep:' + ep.id, 'Post-its do episódio')
  JOURNEY.forEach((l, i) => out.push({ group: 'Jornada do herói', color: '#1e1b18', label: `${pad2(i + 1)} ${l}`, chip: `jornada ${pad2(i + 1)} ${l}`, search: s.plans[serie.id]?.journeyNotes[i] ?? '', target: { kind: 'stage', s: serie.id, i } }))
  const beatKey = ep ? 'ep:' + ep.id : serie.id
  ATOS.forEach((b, i) => out.push({ group: 'Linha do tempo · 3 atos', color: '#a8432f', label: b.label, chip: b.label, search: s.plans[beatKey]?.atos[i]?.note ?? '', target: { kind: 'beat', k: beatKey, i } }))
  serieEpisodes(s, serie.id).forEach((e) => out.push({ group: 'Episódios', color: '#2c5bd1', label: `ep. ${epNum(e.num)} — ${e.title}`, chip: `ep. ${epNum(e.num)} ${e.title}`, search: e.logline, target: { kind: 'episode', id: e.id } }))
  s.ideas.filter((i) => i.serieId === serie.id).forEach((i) => out.push({ group: 'Ideias', color: i.color, label: short(i.text), chip: 'ideia: ' + short(i.text), search: i.text, target: { kind: 'idea', s: serie.id, id: i.id } }))
  return out
}

/** Prévia do conteúdo do alvo (para o popover). */
export function linkPreview(s: EnredoState, t: LinkTarget): string {
  switch (t.kind) {
    case 'note': {
      const n = s.plans[t.k]?.wall.notes.find((x) => x.id === t.id)
      return n ? n.text || '(post-it vazio)' : 'Esse post-it foi apagado.'
    }
    case 'stage': return s.plans[t.s]?.journeyNotes[t.i] || 'Sem anotação nessa etapa ainda.'
    case 'beat': return s.plans[t.k]?.atos[t.i]?.note || 'Sem anotação nesse ponto ainda.'
    case 'episode': {
      const e = s.episodes.find((x) => x.id === t.id)
      return e ? e.logline || 'Sem logline ainda.' : 'Esse episódio foi apagado.'
    }
    case 'idea': return s.ideas.find((x) => x.id === t.id)?.text ?? 'Essa ideia foi apagada.'
  }
}

/** Serie de uma chave de plano ('s1' ou 'ep:e1'). */
function planPath(s: EnredoState, k: string) {
  if (!k.startsWith('ep:')) return { path: `/h/${k}/plano`, ok: s.series.some((x) => x.id === k) }
  const e = s.episodes.find((x) => x.id === k.slice(3))
  return { path: e ? `/h/${e.serieId}/ep/${e.id}/plano` : '/', ok: !!e }
}

/** Para onde "Ir até lá" leva, e qual quadro precisa existir no plano. */
export function linkDestination(s: EnredoState, t: LinkTarget): { url: string; board?: { key: string; id: BoardId } } | null {
  switch (t.kind) {
    case 'note': {
      const p = planPath(s, t.k)
      return p.ok ? { url: `${p.path}?quadro=postits&tela=cheia&nota=${t.id}`, board: { key: t.k, id: 'postits' } } : null
    }
    case 'stage': {
      const p = planPath(s, t.s)
      return p.ok ? { url: `${p.path}?quadro=jornada&sel=${t.i}`, board: { key: t.s, id: 'jornada' } } : null
    }
    case 'beat': {
      const p = planPath(s, t.k)
      return p.ok ? { url: `${p.path}?quadro=atos&sel=${t.i}`, board: { key: t.k, id: 'atos' } } : null
    }
    case 'episode': {
      const e = s.episodes.find((x) => x.id === t.id)
      return e ? { url: `/h/${e.serieId}/ep/${e.id}` } : null
    }
    case 'idea':
      return s.ideas.some((x) => x.id === t.id) ? { url: `/h/${t.s}/ideias?ideia=${t.id}` } : null
  }
}
