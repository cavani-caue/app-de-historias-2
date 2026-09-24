import { PROPP } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { pad2 } from '../lib/format'
import type { BoardProps } from './BoardView'
import { Meta } from './common'

export default function ProppBoard({ planKey }: BoardProps) {
  const [plan, setPlan] = usePlan(planKey)
  const count = PROPP.filter((_, i) => plan.propp[i]).length
  return (
    <div>
      <Meta className="mb-3">{count} de 31 funções marcadas</Meta>
      <div className="flex flex-wrap gap-[7px]">
        {PROPP.map((label, i) => {
          const on = !!plan.propp[i]
          return (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              onClick={() => setPlan((p) => ({ propp: { ...p.propp, [i]: !on } }))}
              className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[13px] py-[7px] text-[12px] font-semibold"
              style={on ? { background: '#7b3fe4', color: '#fdf6e8', borderColor: '#7b3fe4' } : { color: '#3a2318', borderColor: 'rgba(58,35,24,.2)' }}
            >
              <span className="font-mono text-[10.5px] opacity-70">{pad2(i + 1)}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
