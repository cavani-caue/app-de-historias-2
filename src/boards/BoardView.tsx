import type { ComponentType } from 'react'
import type { BoardId } from '../types'
import AnatomiaBoard from './AnatomiaBoard'
import AtosBoard from './AtosBoard'
import EscaletaBoard from './EscaletaBoard'
import FichasBoard from './FichasBoard'
import JornadaBoard from './JornadaBoard'
import ProppBoard from './ProppBoard'
import TensionBoard from './TensionBoard'

export interface BoardProps {
  planKey: string
  serieId: string
  epId?: string
}

function WallSoon() {
  return <p className="m-0 py-10 text-center text-[13px] font-semibold text-ink-muted">A parede infinita chega na etapa 6.</p>
}

const BOARDS: Record<BoardId, ComponentType<BoardProps>> = {
  anatomia: AnatomiaBoard,
  jornada: JornadaBoard,
  propp: ProppBoard,
  timeline: TensionBoard,
  atos: AtosBoard,
  escaleta: EscaletaBoard,
  fichas: FichasBoard,
  postits: WallSoon,
}

export function BoardView({ id, ...props }: BoardProps & { id: BoardId }) {
  const Board = BOARDS[id]
  return <Board {...props} />
}
