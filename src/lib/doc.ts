import type { BlockType, PMNode } from '../types'

export interface SimpleBlock {
  type: BlockType
  text: string
  stage?: number
}

/** Converte blocos simples no JSON do TipTap usado pelo editor. */
export function blocksToDoc(blocks: SimpleBlock[]): PMNode {
  return {
    type: 'doc',
    content: blocks.map((b) => ({
      type: 'block',
      attrs: { t: b.type, stage: b.stage ?? null },
      content: b.text ? [{ type: 'text', text: b.text }] : [],
    })),
  }
}

export const emptyDoc = (): PMNode => blocksToDoc([{ type: 'scene', text: 'INT. ' }])

/** Texto puro de um nó (links viram o rótulo). */
export function nodeText(n: PMNode): string {
  if (n.type === 'text') return n.text ?? ''
  if (n.type === 'link') return String(n.attrs?.label ?? '')
  return (n.content ?? []).map(nodeText).join('')
}

/** Lista plana de blocos (tipo + texto) a partir do JSON do documento. */
export function docBlocks(doc: PMNode): SimpleBlock[] {
  const out: SimpleBlock[] = []
  const walk = (n: PMNode) => {
    if (n.type === 'block') {
      const stage = n.attrs?.stage
      out.push({ type: (n.attrs?.t as BlockType) ?? 'action', text: nodeText(n), stage: typeof stage === 'number' ? stage : undefined })
    } else if (n.type === 'listItem') {
      out.push({ type: 'action', text: '• ' + nodeText(n) })
    } else n.content?.forEach(walk)
  }
  walk(doc)
  return out
}

export interface Gap {
  index: number
  text: string
  stage: number
}

export function docGaps(doc: PMNode): Gap[] {
  return docBlocks(doc)
    .filter((b) => b.type === 'gap')
    .map((b, index) => ({ index, text: b.text.replace(/^\?+\s*/, '').trim() || '(sem descrição)', stage: b.stage ?? -1 }))
}

export const docScenes = (doc: PMNode) => docBlocks(doc).filter((b) => b.type === 'scene')
