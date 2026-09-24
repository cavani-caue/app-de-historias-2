import type { Arc, BoardId, Doc, Episode, Idea, Plan, Serie, StcCard, Wall } from '../types'
import { blocksToDoc, type SimpleBlock } from '../lib/doc'
import { DEFAULT_BOARDS_EPISODE, DEFAULT_BOARDS_SERIE } from './constants'

export function emptyWall(): Wall {
  return {
    vx: 40, vy: 40, scale: 1, strokes: [], groups: [],
    notes: [{ id: 'n0', x: 60, y: 60, w: 220, h: 160, color: '#f4e08a', text: 'Solte aqui tudo que vier sobre este episódio.' }],
  }
}

/** Plano novo, com os quadros padrão do escopo. */
export function newPlan(key: string, patch: Partial<Plan> = {}): Plan {
  const isEp = key.startsWith('ep:')
  return {
    key,
    premissa: '',
    pergunta: '',
    principio: '',
    ...(isEp ? {} : { formato: 'Série · 30 min', previstos: 6 }),
    boards: (isEp ? DEFAULT_BOARDS_EPISODE : DEFAULT_BOARDS_SERIE).slice() as BoardId[],
    anatomia: {},
    journeyNotes: {},
    propp: {},
    tension: {},
    atos: {},
    escaleta: [],
    stc: [],
    wall: emptyWall(),
    ...patch,
  }
}

export interface SeedData {
  series: Serie[]
  arcs: Arc[]
  episodes: Episode[]
  docs: Doc[]
  ideas: Idea[]
  plans: Plan[]
}

const b = (type: SimpleBlock['type'], text: string, stage?: number): SimpleBlock => ({ type, text, stage })

export function buildSeed(now = Date.now()): SeedData {
  const day = 864e5
  const series: Serie[] = [
    { id: 's1', title: 'A Casa Vazia', kind: 'Série', createdAt: now - 40 * day, updatedAt: now - day },
    { id: 's2', title: 'Marina e o Rio', kind: 'Série', createdAt: now - 35 * day, updatedAt: now - 7 * day },
    { id: 's3', title: 'Estação Terminal', kind: 'Longa', createdAt: now - 30 * day, updatedAt: now - 2 * day },
    { id: 's4', title: 'Pequenos Monstros', kind: 'Série', createdAt: now - 10 * day, updatedAt: now - 3 * day },
  ]

  const arcs: Arc[] = [
    { id: 's1-a1', serieId: 's1', title: 'Arco 1 — a casa ainda de pé', color: '#a8432f' },
    { id: 's1-a2', serieId: 's1', title: 'Arco 2 — o que a carta pede', color: '#2c5bd1' },
    { id: 's1-a3', serieId: 's1', title: 'Arco 3 — depois da venda', color: '#0f6e63' },
    { id: 's2-a1', serieId: 's2', title: 'Arco 1', color: '#a8432f' },
    { id: 's3-a1', serieId: 's3', title: 'Arco 1', color: '#a8432f' },
    { id: 's4-a1', serieId: 's4', title: 'Arco 1', color: '#a8432f' },
  ]

  const episodes: Episode[] = [
    { id: 'e1', serieId: 's1', num: 1, title: 'A chegada', logline: 'Três irmãos voltam pra vender a casa da infância e acham uma carta.', phase: 'vomit', status: 'canon', arcId: 's1-a1', func: 'Piloto', createdAt: now - 19 * day },
    { id: 'e2', serieId: 's1', num: 2, title: 'O inventário', logline: 'Dividir os móveis vira dividir a memória.', phase: 'maturacao', status: 'canon', arcId: 's1-a1', func: 'Aprofunda', createdAt: now - 15 * day },
    { id: 'e3', serieId: 's1', num: 3, title: 'A última condição', logline: 'O que a mãe pediu só vale se os três concordarem.', phase: 'brainstorm', status: 'temp', arcId: 's1-a2', func: 'Virada', createdAt: now - 9 * day },
    { id: 'e4', serieId: 's2', num: 1, title: 'O rio sabe', logline: 'Marina descobre de quem o irmão é filho.', phase: 'plan', status: 'canon', arcId: 's2-a1', func: 'Piloto', createdAt: now - 17 * day },
    { id: 'e5', serieId: 's4', num: 1, title: 'A babá nova', logline: 'Ela entende as crianças melhor do que os pais gostariam.', phase: 'segunda', status: 'canon', arcId: 's4-a1', func: 'Piloto', createdAt: now - 9 * day },
    { id: 'e6', serieId: 's4', num: 2, title: 'Regras da casa', logline: 'As crianças escrevem as regras. Os pais assinam sem ler.', phase: 'brainstorm', status: 'idea', arcId: 's4-a1', func: 'Aprofunda', createdAt: now - 5 * day },
    { id: 'e7', serieId: 's3', num: 1, title: 'Estação Terminal', logline: 'O último trem parte sem passageiros.', phase: 'maturacao', status: 'canon', arcId: 's3-a1', func: 'Único', createdAt: now - 29 * day },
  ]

  const unlock = now + 3 * day + 6 * 36e5 + 12 * 6e4
  const casa = [
    b('scene', 'INT. COZINHA DA CASA DA MÃE - MADRUGADA'),
    b('action', 'A luz da geladeira é a única coisa acesa. MARINA (34) está parada na frente dela há mais tempo do que precisava.'),
    b('character', 'TIAGO'),
    b('paren', '(da porta)'),
    b('dialog', 'Você achou a carta, né.'),
    b('action', 'Marina fecha a geladeira. O escuro cobre os dois.'),
    b('character', 'MARINA'),
    b('dialog', 'Achei. E você já sabia que ela ia deixar isso pra gente.'),
    b('gap', '??? falta o resto da briga — não sei como o Tiago reage', 7),
    b('transition', 'CORTA PARA:'),
    b('scene', 'EXT. QUINTAL - AMANHECER'),
    b('action', 'O mato tomou conta do que um dia foi horta.'),
  ]
  const d = (id: string, episodeId: string, phase: Doc['phase'], title: string, format: string, blocks: SimpleBlock[], ageDays: number, lockedUntil?: number): Doc => ({
    id, episodeId, phase, title, format, content: blocksToDoc(blocks), lockedUntil, lockedAt: lockedUntil ? now - 4 * day : undefined, createdAt: now - 30 * day + Number(id.slice(1)) * 6e4, updatedAt: now - ageDays * day,
  })
  const docs: Doc[] = [
    d('d1', 'e1', 'vomit', 'Vomit draft — tentativa 1', 'Roteiro', casa, 1),
    d('d2', 'e1', 'vomit', 'Vomit draft — tentativa 2 (mais seca)', 'Roteiro', [b('scene', 'INT. COZINHA - MADRUGADA'), b('action', 'Sem falas nessa versão. Só o que dá pra ver.')], 2),
    d('d3', 'e1', 'plan', 'Escaleta em 8 sequências', 'Escaleta', [b('scene', 'SEQUÊNCIA 1 - A CHEGADA'), b('action', 'Os três chegam em horários diferentes. Ninguém combina nada.')], 4),
    d('d4', 'e1', 'brainstorm', 'Bagunça inicial', 'Notas', [b('gap', '??? e se a carta for endereçada só pra um deles?', 1), b('action', 'A casa cheira a remédio mesmo depois de limpa.')], 6),
    d('d5', 'e2', 'maturacao', 'Inventário — v1', 'Roteiro', [b('scene', 'INT. SALA - DIA'), b('action', 'Etiquetas amarelas em tudo que tem valor.')], 3, unlock),
    d('d6', 'e1', 'segunda', 'A chegada — 2ª versão', 'Roteiro', [b('scene', 'INT. COZINHA DA CASA DA MÃE - MADRUGADA'), b('action', 'Agora com a cabeça fria.')], 0),
    d('d7', 'e4', 'plan', 'Mapa do rio', 'Escaleta', [b('action', 'O rio aparece em cinco momentos. Sempre mais cheio.')], 7),
    d('d8', 'e5', 'segunda', 'A babá nova — passe 2', 'Roteiro', [b('scene', 'INT. QUARTO DAS CRIANÇAS - NOITE'), b('action', 'A babá fecha a porta por dentro.')], 3),
    d('d9', 'e7', 'maturacao', 'Estação Terminal — v1', 'Roteiro', [b('scene', 'EXT. PLATAFORMA - MADRUGADA'), b('action', 'O trem parte vazio.')], 2, unlock + 4 * day),
  ]

  const ideas: Idea[] = [
    { id: 'i1', serieId: 's1', kind: 'Trama', text: 'A casa foi vendida antes do primeiro episódio — e ninguém contou pros irmãos.', color: '#f4e08a', rot: -1.4, pinned: true, createdAt: now - 2 * 36e5 },
    { id: 'i2', serieId: 's1', kind: 'Diálogo', text: '"Você achou a carta, né." — e ele não responde.', color: '#f4b7c0', rot: 1.1, pinned: false, createdAt: now - day },
    { id: 'i3', serieId: 's1', kind: 'Cena', text: 'Velório onde ninguém chora, todos comem.', color: '#b9e0a5', rot: -0.8, pinned: false, createdAt: now - day - 36e5 },
    { id: 'i4', serieId: 's1', kind: 'Mundo', text: 'Toda vez que chove, a casa cheira a remédio.', color: '#a8d0e6', rot: 1.6, pinned: true, createdAt: now - 3 * day },
    { id: 'i5', serieId: 's1', kind: 'Personagem', text: 'O irmão do meio mente sobre coisas pequenas e inúteis.', color: '#c9b6e4', rot: -1.2, pinned: false, createdAt: now - 4 * day },
    { id: 'i6', serieId: 's2', kind: 'Trama', text: 'O irmão mais novo da Marina é filho do vilão — e o rio sabe.', color: '#f2b26b', rot: 0.9, pinned: true, createdAt: now - 7 * day },
  ]

  const stc: StcCard[] = [
    { id: 'c1', row: 0, title: 'EXT. CASA DA MÃE - DIA', text: 'Os três chegam em horários diferentes. Ninguém tem a chave.', emo: '−/+', conflict: 'Marina >< Tiago', story: 'A', beat: 'Imagem de abertura' },
    { id: 'c2', row: 0, title: 'INT. COZINHA - MADRUGADA', text: 'Marina acha a carta atrás da geladeira.', emo: '+/−', conflict: 'Marina >< a mãe (ausente)', story: 'A', beat: 'Catalisador' },
    { id: 'c3', row: 0, title: 'INT. SALA - DIA', text: 'Leem a condição juntos. Tiago quer ignorar.', emo: '+/−', conflict: 'Tiago >< Marina', story: 'A', beat: 'Debate' },
    { id: 'c4', row: 1, title: 'INT. QUARTO DOS FUNDOS - NOITE', text: 'Caio confessa que já tinha visitado a casa.', emo: '−/+', conflict: 'Caio >< a própria culpa', story: 'B', beat: 'História B' },
    { id: 'c5', row: 2, title: 'EXT. QUINTAL - AMANHECER', text: 'A imobiliária aparece antes da hora.', emo: '+/−', conflict: 'irmãos >< corretor', story: 'A', beat: 'Os vilões se aproximam' },
    { id: 'c6', row: 3, title: 'INT. CASA VAZIA - DIA', text: 'A casa sem móveis. Os três no chão.', emo: '−/+', conflict: 'irmãos >< o passado', story: 'A', beat: 'Imagem final' },
  ]

  const ideaWall = (serieId: string): Wall => {
    const list = ideas.filter((i) => i.serieId === serieId)
    if (!list.length) return emptyWall()
    const rows = Math.ceil(list.length / 4)
    return {
      vx: 40, vy: 40, scale: 1, strokes: [],
      groups: [{ id: 'g0', x: 20, y: 20, w: 880, h: rows * 200 + 40, title: 'Ideias soltas', color: '#a8432f' }],
      notes: list.map((i, n) => ({ id: 'w' + i.id, x: 40 + (n % 4) * 210, y: 50 + Math.floor(n / 4) * 200, w: 180, h: 150, color: i.color, text: i.text })),
    }
  }

  const plans: Plan[] = [
    newPlan('s1', { premissa: 'Três irmãos têm 30 dias para vender a casa da mãe — e uma condição no testamento que só vale se os três concordarem.', pergunta: 'O que a gente deve a quem já morreu?', formato: 'Série · 30 min', previstos: 6, stc, wall: ideaWall('s1'), tension: { e1: 2, e2: 3, e3: 4 } }),
    newPlan('s2', { premissa: 'Uma menina descobre que o irmão é filho do homem que afundou a cidade — e o rio é a única testemunha.', pergunta: 'Dá pra amar alguém sabendo de onde ele veio?', formato: 'Série · 50 min', previstos: 8, wall: ideaWall('s2') }),
    newPlan('s3', { premissa: 'O último trem de uma estação condenada parte sem passageiros, todo dia, há trinta anos.', pergunta: 'Quem fica quando todo mundo vai embora?', formato: 'Longa · 100 min', previstos: 1 }),
    newPlan('s4', { premissa: 'A babá nova entende as crianças melhor do que os pais gostariam.', pergunta: 'De quem é a casa, afinal?', formato: 'Série · 30 min', previstos: 8 }),
    newPlan('ep:e1', {
      pergunta: 'Os três vão conseguir passar uma noite na casa sem brigar?',
      escaleta: [
        { id: 'k1', heading: 'EXT. CASA DA MÃE - DIA', text: 'Os três chegam em horários diferentes. Ninguém tem a chave.' },
        { id: 'k2', heading: 'INT. SALA - DIA', text: 'Móveis cobertos com lençol. Tiago já quer ligar pra imobiliária.' },
        { id: 'k3', heading: 'INT. COZINHA - MADRUGADA', text: 'Marina acha a carta atrás da geladeira.' },
        { id: 'k4', heading: 'EXT. QUINTAL - AMANHECER', text: 'Ela lê em voz alta. A condição só vale se os três concordarem.' },
      ],
    }),
  ]

  return { series, arcs, episodes, docs, ideas, plans }
}
