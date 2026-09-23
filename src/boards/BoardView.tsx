import { BOARDS } from '../data/constants'
import type { BoardId } from '../types'

export interface BoardProps {
  planKey: string
  serieId: string
  epId?: string
}

export function BoardView({ id }: BoardProps & { id: BoardId }) {
  const b = BOARDS.find((x) => x.id === id)
  const etapa = id === 'postits' ? 6 : 5
  return (
    <div className="py-10 text-center">
      <div className="font-serif text-[26px] text-ink">{b?.label}</div>
      <p className="mt-1 text-[13px] text-ink-soft">{b?.desc}</p>
      <p className="mt-3 text-[12px] font-semibold text-ink-muted">Este quadro chega na etapa {etapa}.</p>
    </div>
  )
}
