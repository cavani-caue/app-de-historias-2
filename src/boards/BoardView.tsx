import { useCallback, useEffect, type ComponentType } from 'react'
import { useSearchParams } from 'react-router'
import type { BoardId } from '../types'
import AnatomiaBoard from './AnatomiaBoard'
import AtosBoard from './AtosBoard'
import EscaletaBoard from './EscaletaBoard'
import FichasBoard from './FichasBoard'
import JornadaBoard from './JornadaBoard'
import ProppBoard from './ProppBoard'
import TensionBoard from './TensionBoard'
import Wall from './Wall'

export interface BoardProps {
  planKey: string
  serieId: string
  epId?: string
}

/** Parede com tela cheia e foco em post-it controlados pela URL (?tela=cheia&nota=id). */
function WallBoard({ planKey }: BoardProps) {
  const [params, setParams] = useSearchParams()
  const full = params.get('tela') === 'cheia'
  const setFull = useCallback((on: boolean) => setParams((p) => {
    if (on) p.set('tela', 'cheia'); else { p.delete('tela'); p.delete('nota') }
    return p
  }, { replace: true }), [setParams])

  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, setFull])

  return <Wall planKey={planKey} full={full} onToggleFull={() => setFull(!full)} focusNote={params.get('nota')} />
}

const BOARDS: Record<BoardId, ComponentType<BoardProps>> = {
  anatomia: AnatomiaBoard,
  jornada: JornadaBoard,
  propp: ProppBoard,
  timeline: TensionBoard,
  atos: AtosBoard,
  escaleta: EscaletaBoard,
  fichas: FichasBoard,
  postits: WallBoard,
}

export function BoardView({ id, ...props }: BoardProps & { id: BoardId }) {
  const Board = BOARDS[id]
  return <Board {...props} />
}
