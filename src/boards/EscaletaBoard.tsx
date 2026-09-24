import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { usePlan } from '../hooks/usePlan'
import { blocksToDoc, type SimpleBlock } from '../lib/doc'
import { pad2, plural } from '../lib/format'
import { uid } from '../lib/id'
import { useStore } from '../store'
import type { Plan } from '../types'
import type { BoardProps } from './BoardView'

type Row = Plan['escaleta'][number]

export default function EscaletaBoard({ planKey, epId }: BoardProps) {
  const navigate = useNavigate()
  const [plan, setPlan] = usePlan(planKey)
  const addDoc = useStore((s) => s.addDoc)
  const rows = plan.escaleta
  const setRows = (fn: (r: Row[]) => Row[]) => setPlan((p) => ({ escaleta: fn(p.escaleta) }))
  const patch = (id: string, v: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...v } : x)))
  const move = (i: number, d: -1 | 1) => setRows((r) => {
    const j = i + d
    if (j < 0 || j >= r.length) return r
    const a = r.slice(); [a[i], a[j]] = [a[j], a[i]]; return a
  })

  const toDraft = () => {
    if (!epId) return
    const blocks: SimpleBlock[] = rows.flatMap((r) => [{ type: 'scene' as const, text: r.heading.trim() || 'INT. ' }, { type: 'action' as const, text: r.text }])
    const doc = addDoc(epId, 'vomit', {
      title: 'Vomit draft — da escaleta',
      format: 'Roteiro',
      content: blocksToDoc(blocks.length ? blocks : [{ type: 'scene', text: 'INT. ' }]),
    })
    navigate('/texto/' + doc.id)
  }

  return (
    <div>
      <div className="mb-[14px] flex flex-wrap items-start gap-4">
        <p className="m-0 flex-[1_1_320px] text-[13px] leading-[1.5] text-ink/75">
          Escaleta é a lista das cenas em ordem, uma linha por cena: onde acontece e o que muda. Sem diálogo. É a ponte entre a ideia e o roteiro — quando estiver boa, vira o esqueleto do vomit draft.
        </p>
        <span className="pt-2.5 font-mono text-[11px] text-ink/60">{plural(rows.length, 'cena', 'cenas')}</span>
        <button
          type="button"
          onClick={toDraft}
          disabled={!epId}
          title={epId ? 'Cria um texto na fase Vomit draft com uma cena e uma ação por linha' : 'Disponível no planejamento de um episódio'}
          className="inline-flex items-center gap-2 rounded-full bg-ph-vomit px-[17px] py-2.5 text-[13px] font-bold whitespace-nowrap text-[#0d2a12] hover:brightness-95 disabled:opacity-50"
        >
          Virar vomit draft →
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <div key={r.id} className="flex flex-wrap items-center gap-2.5 rounded-[12px] bg-paper-2 px-3 py-2">
            <span className="shrink-0 font-display text-[14px] text-accent">{pad2(i + 1)}</span>
            <input value={r.heading} onChange={(e) => patch(r.id, { heading: e.target.value })} aria-label="Cabeçalho da cena" className="min-w-0 flex-[1_1_220px] border-0 bg-transparent font-script text-[13px] font-bold text-ink uppercase outline-none" />
            <input value={r.text} onChange={(e) => patch(r.id, { text: e.target.value })} aria-label="O que acontece" placeholder="o que acontece e o que muda…" className="min-w-0 flex-[2_1_280px] border-0 bg-transparent font-script text-[13px] text-ink outline-none placeholder:text-ink/35" />
            <span className="flex shrink-0 gap-1 text-ink/45">
              <button type="button" aria-label="Subir" onClick={() => move(i, -1)} className="rounded p-0.5 hover:text-ink"><ChevronUp size={15} /></button>
              <button type="button" aria-label="Descer" onClick={() => move(i, 1)} className="rounded p-0.5 hover:text-ink"><ChevronDown size={15} /></button>
              <button type="button" aria-label="Apagar cena" onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))} className="rounded p-0.5 hover:text-accent"><X size={15} /></button>
            </span>
          </div>
        ))}
        <button type="button" onClick={() => setRows((r) => [...r, { id: uid('k'), heading: 'INT. ', text: '' }])} className="rounded-[12px] border-2 border-dashed border-rail/28 p-2.5 text-center text-[12.5px] font-semibold text-ink/60 hover:bg-rail/5">
          + cena
        </button>
      </div>
    </div>
  )
}
