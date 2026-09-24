import { ANATOMY } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import type { BoardProps } from './BoardView'

export default function AnatomiaBoard({ planKey }: BoardProps) {
  const [plan, setPlan] = usePlan(planKey)
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[14px]">
      {ANATOMY.map((a) => (
        <label key={a.key} className="block rounded-[18px] bg-paper-2 px-4 py-[14px]">
          <span className="block text-[11px] font-bold tracking-[.1em] text-accent uppercase">{a.label}</span>
          <span className="mt-1 mb-2 block text-[11.5px] leading-[1.35] text-ink-muted">{a.hint}</span>
          <textarea
            value={plan.anatomia[a.key] ?? ''}
            onChange={(e) => setPlan((p) => ({ anatomia: { ...p.anatomia, [a.key]: e.target.value } }))}
            rows={2}
            placeholder="escreva aqui…"
            className="w-full resize-y border-0 bg-transparent font-serif text-[17px] leading-[1.35] text-ink outline-none placeholder:text-ink/35"
          />
        </label>
      ))}
    </div>
  )
}
