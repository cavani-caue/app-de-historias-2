import Dexie, { type EntityTable } from 'dexie'
import type { Arc, Doc, Episode, Idea, PhaseArt, Plan, Serie, StoredImage } from './types'

export class EnredoDB extends Dexie {
  series!: EntityTable<Serie, 'id'>
  arcs!: EntityTable<Arc, 'id'>
  episodes!: EntityTable<Episode, 'id'>
  docs!: EntityTable<Doc, 'id'>
  ideas!: EntityTable<Idea, 'id'>
  plans!: EntityTable<Plan, 'key'>
  images!: EntityTable<StoredImage, 'id'>
  phaseArt!: EntityTable<PhaseArt, 'key'>
  meta!: EntityTable<{ key: string; value: unknown }, 'key'>

  constructor() {
    super('enredo')
    this.version(1).stores({
      series: 'id, updatedAt',
      arcs: 'id, serieId',
      episodes: 'id, serieId',
      docs: 'id, episodeId, phase, updatedAt',
      ideas: 'id, serieId',
      plans: 'key',
      images: 'id',
      phaseArt: 'key',
      meta: 'key',
    })
  }
}

export const db = new EnredoDB()
