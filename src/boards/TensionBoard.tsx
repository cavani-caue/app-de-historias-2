import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { statusOf } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { epNum } from '../lib/format'
import { serieEpisodes } from '../lib/selectors'
import { useStore } from '../store'
import type { BoardProps } from './BoardView'
import { Meta } from './common'

export default function TensionBoard({ planKey, serieId }: BoardProps) {
  const navigate = useNavigate()
  const [plan, setPlan] = usePlan(planKey)
  const eps = useStore(useShallow((s) => serieEpisodes(s, serieId)))
  const set = (id: string, v: number) => setPlan((p) => ({ tension: { ...p.tension, [id]: Math.min(5, Math.max(1, v)) } }))

  if (!eps.length) return <Meta>Nenhum episódio ainda.</Meta>
  return (
    <div>
      <Meta className="mb-[14px]">curva de tensão — use + e − em cada episódio</Meta>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-3 border-b-2 border-rail/20 pb-2.5">
          {eps.map((e) => {
            const t = plan.tension[e.id] ?? 3
            const st = statusOf(e.status)
            return (
              <div key={e.id} className="flex min-w-[120px] flex-1 flex-col items-center gap-2">
                <button type="button" aria-label={`Mais tensão no ep. ${epNum(e.num)}`} onClick={() => set(e.id, t + 1)} disabled={t >= 5} className="text-ink/55 hover:text-ink disabled:opacity-30"><Plus size={15} /></button>
                <button
                  type="button"
                  title={`ep. ${epNum(e.num)} — tensão ${t} de 5. Clique para abrir.`}
                  onClick={() => navigate(`/h/${serieId}/ep/${e.id}`)}
                  className="flex w-full items-start justify-center rounded-t-[14px] pt-2 transition-[height] duration-200"
                  style={{ height: 28 + t * 34, background: st.bg, color: st.fg }}
                >
                  <span className="font-display text-[14px]">{epNum(e.num)}</span>
                </button>
                <button type="button" aria-label={`Menos tensão no ep. ${epNum(e.num)}`} onClick={() => set(e.id, t - 1)} disabled={t <= 1} className="text-ink/55 hover:text-ink disabled:opacity-30"><Minus size={15} /></button>
              </div>
            )
          })}
        </div>
        <div className="mt-2.5 flex gap-3">
          {eps.map((e) => <div key={e.id} className="min-w-[120px] flex-1 text-center text-[12px] leading-[1.3] text-ink/70">{e.title}</div>)}
        </div>
      </div>
    </div>
  )
}
