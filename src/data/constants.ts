import type { BlockType, BoardId, PhaseId, StatusId } from '../types'

export interface PhaseDef {
  id: PhaseId
  num: string
  title: string
  desc: string
  noun: string
  color: string
  ink: string
  inkSoft: string
  chipBg: string
  halo: string
  rule: string
  ghost: string
  glow: string
}

export const PHASES: PhaseDef[] = [
  { id: 'brainstorm', num: '1', title: 'Brainstorming', desc: 'Parede infinita do episódio: post-its, desenho, grupos. Nada vira texto ainda.', noun: 'bagunça', color: '#7b3fe4', ink: '#fdf6e8', inkSoft: 'rgba(253,246,232,.8)', chipBg: 'rgba(18,4,40,.34)', halo: 'rgba(123,63,228,.28)', rule: '#f5c518', ghost: 'rgba(253,246,232,.13)', glow: 'rgba(245,197,24,.5)' },
  { id: 'plan', num: '2', title: 'Planejamento', desc: 'Anatomia, escaleta, linha do tempo em 3 atos. O desenho antes do texto.', noun: 'escaleta', color: '#e8a12a', ink: '#2c1005', inkSoft: 'rgba(44,16,5,.75)', chipBg: 'rgba(255,255,255,.42)', halo: 'rgba(232,161,42,.3)', rule: '#2c1005', ghost: 'rgba(44,16,5,.12)', glow: 'rgba(255,255,255,.45)' },
  { id: 'vomit', num: '3', title: 'Vomit draft', desc: 'Escreve feio de propósito, do começo ao fim, sem voltar pra corrigir.', noun: 'vomit draft', color: '#25a244', ink: '#0d2a12', inkSoft: 'rgba(13,42,18,.75)', chipBg: 'rgba(255,255,255,.42)', halo: 'rgba(37,162,68,.28)', rule: '#0d2a12', ghost: 'rgba(13,42,18,.12)', glow: 'rgba(255,255,255,.42)' },
  { id: 'maturacao', num: '4', title: 'Maturação', desc: 'O texto some dos seus olhos até o relógio zerar.', noun: 'texto trancado', color: '#0f6e63', ink: '#eafaf3', inkSoft: 'rgba(234,250,243,.82)', chipBg: 'rgba(2,28,24,.44)', halo: 'rgba(15,110,99,.3)', rule: '#7fe0c4', ghost: 'rgba(234,250,243,.12)', glow: 'rgba(127,224,196,.45)' },
  { id: 'segunda', num: '5', title: '2ª versão', desc: 'Reescreve com a cabeça fria, comparando com o rascunho ruim.', noun: '2ª versão', color: '#2c5bd1', ink: '#f0f4ff', inkSoft: 'rgba(240,244,255,.8)', chipBg: 'rgba(6,18,54,.34)', halo: 'rgba(44,91,209,.28)', rule: '#f5c518', ghost: 'rgba(240,244,255,.13)', glow: 'rgba(240,244,255,.4)' },
  { id: 'refino', num: '6', title: 'Refino', desc: 'Ritmo, continuidade, diálogo. Corta o que não serve à cena.', noun: 'passe de refino', color: '#e8622a', ink: '#2c1005', inkSoft: 'rgba(44,16,5,.75)', chipBg: 'rgba(255,255,255,.42)', halo: 'rgba(232,98,42,.3)', rule: '#2c1005', ghost: 'rgba(44,16,5,.12)', glow: 'rgba(255,230,200,.45)' },
  { id: 'pronto', num: '7', title: 'Pronto (por ora)', desc: 'Versão que você aceita mostrar pra alguém. Sempre dá pra reabrir.', noun: 'versão final', color: '#1e1b18', ink: '#f4e9d8', inkSoft: 'rgba(244,233,216,.72)', chipBg: 'rgba(244,233,216,.18)', halo: 'rgba(30,27,24,.32)', rule: '#f4e9d8', ghost: 'rgba(244,233,216,.1)', glow: 'rgba(244,233,216,.22)' },
]
export const phaseOf = (id: PhaseId | string) => PHASES.find((p) => p.id === id) ?? PHASES[0]

export interface StatusDef {
  id: StatusId
  label: string
  desc: string
  bg: string
  fg: string
}
export const STATUSES: StatusDef[] = [
  { id: 'canon', label: 'Canônico', desc: 'Faz parte da história de verdade.', bg: '#25a244', fg: '#0d2a12' },
  { id: 'temp', label: 'Temporário', desc: 'Está aí pra segurar o lugar. Pode cair.', bg: '#e8a12a', fg: '#2c1005' },
  { id: 'idea', label: 'Ideia', desc: 'Só uma possibilidade de episódio.', bg: '#7b3fe4', fg: '#fdf6e8' },
  { id: 'cut', label: 'Descartado', desc: 'Fora da série, guardado por via das dúvidas.', bg: 'rgba(58,35,24,.22)', fg: 'rgba(42,27,18,.7)' },
]
export const statusOf = (id: StatusId | string) => STATUSES.find((s) => s.id === id) ?? STATUSES[0]

export const FUNCS = ['Piloto', 'Aprofunda', 'Virada', 'Respiro', 'Clímax', 'Final', 'Único']
export const FORMATS = ['Curta', 'Série · 30 min', 'Série · 50 min', 'Longa · 100 min']
export const KINDS = ['Trama', 'Cena', 'Diálogo', 'Personagem', 'Mundo', 'Reviravolta']
export const NOTE_COLORS = ['#f4e08a', '#f4b7c0', '#b9e0a5', '#a8d0e6', '#c9b6e4', '#f2b26b']
export const PEN_COLORS = ['#2a1b12', '#a8432f', '#2c5bd1', '#25a244']
export const ARC_COLORS = ['#a8432f', '#2c5bd1', '#0f6e63', '#7b3fe4', '#e8622a', '#d62e7b']

export const ANATOMY = [
  { key: 'falha', label: 'Falha e necessidade', hint: 'O que nele está quebrado — e o que ele precisa aprender, mesmo sem saber.' },
  { key: 'desejo', label: 'Desejo', hint: 'O que ele quer, concreto o bastante pra gente torcer.' },
  { key: 'oponente', label: 'Oponente', hint: 'Quem quer a mesma coisa — e disputa o mesmo terreno.' },
  { key: 'plano', label: 'Plano', hint: 'Como ele pretende vencer. De preferência, errado.' },
  { key: 'batalha', label: 'Batalha', hint: 'O confronto final que decide quem fica com o quê.' },
  { key: 'revelacao', label: 'Autorrevelação', hint: 'O que ele descobre sobre si quando já não dá pra desconversar.' },
  { key: 'equilibrio', label: 'Novo equilíbrio', hint: 'Como fica o mundo depois — melhor, pior, mas nunca igual.' },
]

export const JOURNEY = [
  'Mundo comum', 'Chamado à aventura', 'Recusa do chamado', 'Encontro com o mentor',
  'Travessia do limiar', 'Provas, aliados e inimigos', 'Aproximação da caverna', 'Provação',
  'Recompensa', 'Caminho de volta', 'Ressurreição', 'Retorno com o elixir',
]

export const PROPP = [
  'Afastamento', 'Proibição', 'Transgressão', 'Interrogatório', 'Informação', 'Ardil', 'Cumplicidade',
  'Dano ou carência', 'Mediação', 'Início da reação', 'Partida', 'Primeira função do doador',
  'Reação do herói', 'Recepção do meio mágico', 'Deslocamento', 'Combate', 'Marca', 'Vitória',
  'Reparação do dano', 'Regresso', 'Perseguição', 'Salvamento', 'Chegada incógnita', 'Pretensões falsas',
  'Tarefa difícil', 'Realização', 'Reconhecimento', 'Desmascaramento', 'Transfiguração', 'Castigo', 'Casamento',
]

export const STC_ROWS = [
  { title: 'Ato 1', pages: 'p. 1–25' },
  { title: 'Ato 2A', pages: 'p. 25–55' },
  { title: 'Ato 2B', pages: 'p. 55–85' },
  { title: 'Ato 3', pages: 'p. 85–110' },
]
export const STC_BEATS = [
  { label: 'Imagem de abertura', page: '1' }, { label: 'Tema declarado', page: '5' },
  { label: 'Preparação', page: '1–10' }, { label: 'Catalisador', page: '12' },
  { label: 'Debate', page: '12–25' }, { label: 'Virada para o 2', page: '25' },
  { label: 'História B', page: '30' }, { label: 'Diversão e jogos', page: '30–55' },
  { label: 'Ponto médio', page: '55' }, { label: 'Os vilões se aproximam', page: '55–75' },
  { label: 'Tudo está perdido', page: '75' }, { label: 'Noite escura da alma', page: '75–85' },
  { label: 'Virada para o 3', page: '85' }, { label: 'Final', page: '85–110' },
  { label: 'Imagem final', page: '110' },
]
export const STC_EMO = ['+/−', '−/+', '+/+', '−/−']
export const STC_STORIES = [
  { id: 'A' as const, label: 'Trama A', color: '#2c5bd1', ink: '#f0f4ff' },
  { id: 'B' as const, label: 'Trama B', color: '#d62e7b', ink: '#fff0f7' },
  { id: 'C' as const, label: 'Trama C', color: '#e8a12a', ink: '#2c1005' },
]

export const ATOS = [
  { label: 'Início', x: 40, y: 360, act: 1 },
  { label: 'Incidente incitante', x: 140, y: 333, act: 1 },
  { label: 'Dúvidas', x: 225, y: 311, act: 1 },
  { label: 'Clímax do ato 1', x: 300, y: 291, act: 1, star: true },
  { label: 'Obstáculo', x: 385, y: 269, act: 2 },
  { label: 'Obstáculo', x: 465, y: 247, act: 2 },
  { label: 'Ponto médio', x: 545, y: 226, act: 2, star: true },
  { label: 'Obstáculo', x: 625, y: 205, act: 2 },
  { label: 'Desastre', x: 695, y: 187, act: 2 },
  { label: 'Crise', x: 745, y: 173, act: 2 },
  { label: 'Clímax do ato 2', x: 795, y: 160, act: 2, star: true },
  { label: 'Clímax do ato 3', x: 870, y: 243, act: 3, star: true },
  { label: 'Desfecho', x: 935, y: 315, act: 3 },
  { label: 'Fim', x: 975, y: 360, act: 3 },
]
export const ATOS_TICKS = [40, 72, 40, 60, 40, 72, 90, 40, 90, 40, 120, 60, 90, 40]
export const ACT_NAMES: Record<number, string> = { 1: 'Ato 1 · preparação', 2: 'Ato 2 · confronto', 3: 'Ato 3 · resolução' }

export const BOARDS: { id: BoardId; label: string; desc: string }[] = [
  { id: 'anatomia', label: 'Anatomia da história', desc: 'Falha, desejo, oponente, plano, batalha, autorrevelação, novo equilíbrio.' },
  { id: 'jornada', label: 'Jornada do herói', desc: 'As 12 etapas, marcando onde a sua história já tem material.' },
  { id: 'propp', label: '31 funções de Propp', desc: 'Checklist do conto maravilhoso — bom pra achar buraco.' },
  { id: 'timeline', label: 'Curva de tensão', desc: 'Episódios em sequência com a altura da tensão de cada um.' },
  { id: 'atos', label: 'Linha do tempo · 3 atos', desc: 'Início, incidente, clímax de cada ato, ponto médio, crise e fim.' },
  { id: 'escaleta', label: 'Escaleta', desc: 'A lista das cenas em ordem, uma linha cada. Vira vomit draft num clique.' },
  { id: 'fichas', label: 'Fichas · Save the Cat', desc: 'O quadro de 4 fileiras com +/−, >< e as 15 batidas.' },
  { id: 'postits', label: 'Parede infinita', desc: 'Post-its, desenho livre, zoom e navegação.' },
]
export const DEFAULT_BOARDS_SERIE: BoardId[] = ['anatomia', 'jornada', 'atos', 'fichas', 'postits', 'timeline']
export const DEFAULT_BOARDS_EPISODE: BoardId[] = ['anatomia', 'escaleta', 'atos', 'postits', 'fichas']

export const BLOCK_NEXT: Record<BlockType, BlockType> = { scene: 'action', action: 'action', character: 'dialog', paren: 'dialog', dialog: 'action', transition: 'scene', note: 'action', gap: 'action' }
export const BLOCK_CYCLE: BlockType[] = ['action', 'character', 'dialog', 'paren', 'scene', 'transition']

export const DURATIONS = [
  { label: '3 dias', hint: 'só pra perder o vício', ms: 3 * 864e5 },
  { label: '1 semana', hint: 'o padrão', ms: 7 * 864e5 },
  { label: '1 mês', hint: 'esquece de verdade', ms: 30 * 864e5 },
]
