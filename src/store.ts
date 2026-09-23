import { create } from 'zustand'
import { db } from './db'
import { buildSeed, newPlan } from './data/seed'
import { emptyDoc } from './lib/doc'
import { uid } from './lib/id'
import type { Arc, Doc, Episode, Idea, PhaseId, Plan, Serie } from './types'

type Patch<T> = Partial<T> | ((prev: T) => Partial<T>)
const apply = <T,>(prev: T, p: Patch<T>): T => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })

// Escritas frequentes (parede, editor) são agrupadas por chave.
const timers = new Map<string, ReturnType<typeof setTimeout>>()
function later(key: string, fn: () => void, ms = 250) {
  clearTimeout(timers.get(key))
  timers.set(key, setTimeout(() => { timers.delete(key); fn() }, ms))
}

export interface EnredoState {
  hydrated: boolean
  series: Serie[]
  arcs: Arc[]
  episodes: Episode[]
  docs: Doc[]
  ideas: Idea[]
  plans: Record<string, Plan>
  imageUrls: Record<string, string>
  phaseArt: Record<string, string> // key -> imageId

  load: () => Promise<void>
  resetToSample: () => Promise<void>

  addSerie: (patch?: Partial<Serie>) => Serie
  updateSerie: (id: string, patch: Patch<Serie>) => void
  deleteSerie: (id: string) => void

  addArc: (serieId: string, patch?: Partial<Arc>) => Arc
  updateArc: (id: string, patch: Patch<Arc>) => void

  addEpisode: (serieId: string, patch?: Partial<Episode>) => Episode
  updateEpisode: (id: string, patch: Patch<Episode>) => void
  deleteEpisode: (id: string) => void

  addDoc: (episodeId: string, phase: PhaseId, patch?: Partial<Doc>) => Doc
  updateDoc: (id: string, patch: Patch<Doc>, opts?: { touch?: boolean }) => void
  deleteDoc: (id: string) => void

  addIdea: (serieId: string, patch?: Partial<Idea>) => Idea
  updateIdea: (id: string, patch: Patch<Idea>) => void
  deleteIdea: (id: string) => void

  plan: (key: string) => Plan
  updatePlan: (key: string, patch: Patch<Plan>) => void

  saveImage: (blob: Blob) => Promise<string>
  setPhaseArt: (key: string, blob: Blob | null) => Promise<void>
  setSerieCover: (serieId: string, blob: Blob | null) => Promise<void>
}

async function readAll() {
  const [series, arcs, episodes, docs, ideas, plans, images, phaseArt] = await Promise.all([
    db.series.toArray(), db.arcs.toArray(), db.episodes.toArray(), db.docs.toArray(),
    db.ideas.toArray(), db.plans.toArray(), db.images.toArray(), db.phaseArt.toArray(),
  ])
  return {
    series: series.sort((a, b) => a.createdAt - b.createdAt),
    arcs,
    episodes,
    docs,
    ideas,
    plans: Object.fromEntries(plans.map((p) => [p.key, p])),
    imageUrls: Object.fromEntries(images.map((i) => [i.id, URL.createObjectURL(i.blob)])),
    phaseArt: Object.fromEntries(phaseArt.map((p) => [p.key, p.imageId])),
  }
}

async function writeSeed() {
  const s = buildSeed()
  await db.transaction('rw', [db.series, db.arcs, db.episodes, db.docs, db.ideas, db.plans, db.meta], async () => {
    await Promise.all([
      db.series.bulkPut(s.series), db.arcs.bulkPut(s.arcs), db.episodes.bulkPut(s.episodes),
      db.docs.bulkPut(s.docs), db.ideas.bulkPut(s.ideas), db.plans.bulkPut(s.plans),
      db.meta.put({ key: 'seeded', value: Date.now() }),
    ])
  })
}

export const useStore = create<EnredoState>()((set, get) => {
  const touchSerie = (serieId?: string) => {
    if (serieId) get().updateSerie(serieId, { updatedAt: Date.now() })
  }
  const dropImage = (id: string) => {
    const url = get().imageUrls[id]
    set((s) => { const imageUrls = { ...s.imageUrls }; delete imageUrls[id]; return { imageUrls } })
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000)
    db.images.delete(id)
  }
  const serieOfEpisode = (episodeId: string) => get().episodes.find((e) => e.id === episodeId)?.serieId

  return {
    hydrated: false,
    series: [], arcs: [], episodes: [], docs: [], ideas: [], plans: {}, imageUrls: {}, phaseArt: {},

    load: async () => {
      if (!(await db.meta.get('seeded'))) await writeSeed()
      set({ ...(await readAll()), hydrated: true })
    },

    resetToSample: async () => {
      await Promise.all(db.tables.map((t) => t.clear()))
      await writeSeed()
      set({ ...(await readAll()), hydrated: true })
    },

    // Histórias ----------------------------------------------------------
    addSerie: (patch = {}) => {
      const now = Date.now()
      const serie: Serie = { id: uid('s'), title: 'Nova história', kind: 'Série', createdAt: now, updatedAt: now, ...patch }
      const arc: Arc = { id: uid('a'), serieId: serie.id, title: 'Arco 1', color: '#a8432f' }
      const plan = newPlan(serie.id, serie.kind === 'Longa' ? { formato: 'Longa · 100 min', previstos: 1 } : {})
      set((s) => ({ series: [...s.series, serie], arcs: [...s.arcs, arc], plans: { ...s.plans, [plan.key]: plan } }))
      db.series.put(serie); db.arcs.put(arc); db.plans.put(plan)
      return serie
    },
    updateSerie: (id, patch) => {
      set((s) => ({ series: s.series.map((x) => (x.id === id ? apply(x, patch) : x)) }))
      const next = get().series.find((x) => x.id === id)
      if (next) db.series.put(next)
    },
    deleteSerie: (id) => {
      const epIds = get().episodes.filter((e) => e.serieId === id).map((e) => e.id)
      epIds.forEach((e) => get().deleteEpisode(e))
      set((s) => ({
        series: s.series.filter((x) => x.id !== id),
        arcs: s.arcs.filter((a) => a.serieId !== id),
        ideas: s.ideas.filter((i) => i.serieId !== id),
      }))
      db.series.delete(id)
      db.arcs.where('serieId').equals(id).delete()
      db.ideas.where('serieId').equals(id).delete()
      db.plans.delete(id)
    },

    // Arcos --------------------------------------------------------------
    addArc: (serieId, patch = {}) => {
      const n = get().arcs.filter((a) => a.serieId === serieId).length + 1
      const arc: Arc = { id: uid('a'), serieId, title: 'Arco ' + n, color: '#2c5bd1', ...patch }
      set((s) => ({ arcs: [...s.arcs, arc] }))
      db.arcs.put(arc)
      return arc
    },
    updateArc: (id, patch) => {
      set((s) => ({ arcs: s.arcs.map((x) => (x.id === id ? apply(x, patch) : x)) }))
      const next = get().arcs.find((x) => x.id === id)
      if (next) db.arcs.put(next)
    },

    // Episódios ----------------------------------------------------------
    addEpisode: (serieId, patch = {}) => {
      const eps = get().episodes.filter((e) => e.serieId === serieId)
      const arc = get().arcs.find((a) => a.serieId === serieId)
      const ep: Episode = {
        id: uid('e'), serieId, num: eps.reduce((m, e) => Math.max(m, e.num), 0) + 1,
        title: 'Episódio sem título', logline: '', phase: 'brainstorm', status: 'idea', arcId: arc?.id,
        func: eps.length ? 'Aprofunda' : 'Piloto', createdAt: Date.now(), ...patch,
      }
      set((s) => ({ episodes: [...s.episodes, ep] }))
      db.episodes.put(ep)
      touchSerie(serieId)
      return ep
    },
    updateEpisode: (id, patch) => {
      set((s) => ({ episodes: s.episodes.map((x) => (x.id === id ? apply(x, patch) : x)) }))
      const next = get().episodes.find((x) => x.id === id)
      if (next) { db.episodes.put(next); touchSerie(next.serieId) }
    },
    deleteEpisode: (id) => {
      const docIds = get().docs.filter((d) => d.episodeId === id).map((d) => d.id)
      set((s) => {
        const plans = { ...s.plans }
        delete plans['ep:' + id]
        return { episodes: s.episodes.filter((e) => e.id !== id), docs: s.docs.filter((d) => d.episodeId !== id), plans }
      })
      db.episodes.delete(id)
      db.docs.bulkDelete(docIds)
      db.plans.delete('ep:' + id)
    },

    // Textos -------------------------------------------------------------
    addDoc: (episodeId, phase, patch = {}) => {
      const now = Date.now()
      const doc: Doc = { id: uid('d'), episodeId, phase, title: 'Texto sem título', format: 'Roteiro', content: emptyDoc(), createdAt: now, updatedAt: now, ...patch }
      set((s) => ({ docs: [...s.docs, doc] }))
      db.docs.put(doc)
      touchSerie(serieOfEpisode(episodeId))
      return doc
    },
    updateDoc: (id, patch, opts = {}) => {
      set((s) => ({ docs: s.docs.map((x) => (x.id === id ? { ...apply(x, patch), ...(opts.touch === false ? {} : { updatedAt: Date.now() }) } : x)) }))
      const next = get().docs.find((x) => x.id === id)
      if (next) {
        later('doc:' + id, () => { const cur = get().docs.find((x) => x.id === id); if (cur) db.docs.put(cur) }, 150)
        if (opts.touch !== false) later('touch:' + next.episodeId, () => touchSerie(serieOfEpisode(next.episodeId)), 1000)
      }
    },
    deleteDoc: (id) => {
      set((s) => ({ docs: s.docs.filter((d) => d.id !== id) }))
      db.docs.delete(id)
    },

    // Ideias -------------------------------------------------------------
    addIdea: (serieId, patch = {}) => {
      const idea: Idea = { id: uid('i'), serieId, kind: 'Trama', text: '', color: '#f4e08a', rot: +(Math.random() * 3.2 - 1.6).toFixed(1), pinned: false, createdAt: Date.now(), ...patch }
      set((s) => ({ ideas: [idea, ...s.ideas] }))
      db.ideas.put(idea)
      touchSerie(serieId)
      return idea
    },
    updateIdea: (id, patch) => {
      set((s) => ({ ideas: s.ideas.map((x) => (x.id === id ? apply(x, patch) : x)) }))
      const next = get().ideas.find((x) => x.id === id)
      if (next) db.ideas.put(next)
    },
    deleteIdea: (id) => {
      set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }))
      db.ideas.delete(id)
    },

    // Planejamento -------------------------------------------------------
    plan: (key) => get().plans[key] ?? newPlan(key),
    updatePlan: (key, patch) => {
      const prev = get().plan(key)
      const next = apply(prev, patch)
      set((s) => ({ plans: { ...s.plans, [key]: next } }))
      later('plan:' + key, () => { const cur = get().plans[key]; if (cur) db.plans.put(cur) })
    },

    // Imagens ------------------------------------------------------------
    saveImage: async (blob) => {
      const id = uid('img')
      await db.images.put({ id, blob })
      set((s) => ({ imageUrls: { ...s.imageUrls, [id]: URL.createObjectURL(blob) } }))
      return id
    },
    setPhaseArt: async (key, blob) => {
      const old = get().phaseArt[key]
      if (old) dropImage(old)
      if (!blob) {
        set((s) => { const phaseArt = { ...s.phaseArt }; delete phaseArt[key]; return { phaseArt } })
        await db.phaseArt.delete(key)
        return
      }
      const imageId = await get().saveImage(blob)
      set((s) => ({ phaseArt: { ...s.phaseArt, [key]: imageId } }))
      await db.phaseArt.put({ key, imageId })
    },
    setSerieCover: async (serieId, blob) => {
      const old = get().series.find((x) => x.id === serieId)?.coverId
      if (old) dropImage(old)
      const coverId = blob ? await get().saveImage(blob) : undefined
      get().updateSerie(serieId, { coverId })
    },
  }
})

// Seletores úteis ---------------------------------------------------------
export const useSerie = (id?: string) => useStore((s) => s.series.find((x) => x.id === id))
export const useEpisode = (id?: string) => useStore((s) => s.episodes.find((x) => x.id === id))
export const useDoc = (id?: string) => useStore((s) => s.docs.find((x) => x.id === id))
