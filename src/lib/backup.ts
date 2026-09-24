import { db } from '../db'
import type { Arc, Doc, Episode, Idea, PhaseArt, Plan, Serie } from '../types'

export interface Backup {
  app: 'enredo'
  version: 1
  exportedAt: string
  series: Serie[]
  arcs: Arc[]
  episodes: Episode[]
  docs: Doc[]
  ideas: Idea[]
  plans: Plan[]
  phaseArt: PhaseArt[]
  images: { id: string; type: string; data: string }[] // data URL (base64)
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(b) })

const dataUrlToBlob = async (url: string) => (await fetch(url)).blob()

/** Tudo do banco num JSON só (imagens em base64). */
export async function buildBackup(): Promise<Backup> {
  const [series, arcs, episodes, docs, ideas, plans, phaseArt, images] = await Promise.all([
    db.series.toArray(), db.arcs.toArray(), db.episodes.toArray(), db.docs.toArray(),
    db.ideas.toArray(), db.plans.toArray(), db.phaseArt.toArray(), db.images.toArray(),
  ])
  return {
    app: 'enredo', version: 1, exportedAt: new Date().toISOString(),
    series, arcs, episodes, docs, ideas, plans, phaseArt,
    images: await Promise.all(images.map(async (i) => ({ id: i.id, type: i.blob.type, data: await blobToDataUrl(i.blob) }))),
  }
}

export async function downloadBackup() {
  const data = await buildBackup()
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `enredo-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return data
}

export function parseBackup(text: string): Backup {
  let raw: unknown
  try { raw = JSON.parse(text) } catch { throw new Error('O arquivo não é um JSON válido.') }
  const b = raw as Partial<Backup>
  if (!b || b.app !== 'enredo' || !Array.isArray(b.series) || !Array.isArray(b.docs)) throw new Error('Esse arquivo não parece ser um backup do Enredo.')
  if ((b.version ?? 0) > 1) throw new Error('Esse backup foi feito por uma versão mais nova do Enredo.')
  return {
    app: 'enredo', version: 1, exportedAt: b.exportedAt ?? '',
    series: b.series, arcs: b.arcs ?? [], episodes: b.episodes ?? [], docs: b.docs,
    ideas: b.ideas ?? [], plans: b.plans ?? [], phaseArt: b.phaseArt ?? [], images: b.images ?? [],
  }
}

/** Substitui todo o banco pelo conteúdo do backup. */
export async function restoreBackup(b: Backup) {
  const images = await Promise.all(b.images.map(async (i) => ({ id: i.id, blob: await dataUrlToBlob(i.data) })))
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
    await Promise.all([
      db.series.bulkPut(b.series), db.arcs.bulkPut(b.arcs), db.episodes.bulkPut(b.episodes),
      db.docs.bulkPut(b.docs), db.ideas.bulkPut(b.ideas), db.plans.bulkPut(b.plans),
      db.phaseArt.bulkPut(b.phaseArt), db.images.bulkPut(images),
      db.meta.put({ key: 'seeded', value: Date.now() }),
    ])
  })
}
