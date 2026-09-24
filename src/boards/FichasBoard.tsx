import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { STC_BEATS, STC_EMO, STC_ROWS, STC_STORIES } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { uid } from '../lib/id'
import type { StcCard } from '../types'
import type { BoardProps } from './BoardView'

export default function FichasBoard({ planKey }: BoardProps) {
  const [plan, setPlan] = usePlan(planKey)
  const cards = plan.stc
  const setCards = (fn: (c: StcCard[]) => StcCard[]) => setPlan((p) => ({ stc: fn(p.stc) }))
  const upd = (id: string, v: Partial<StcCard>) => setCards((c) => c.map((x) => (x.id === id ? { ...x, ...v } : x)))
  const next = <T,>(list: T[], cur: T) => list[(list.indexOf(cur) + 1) % list.length]

  return (
    <div>
      <div className="mb-[14px] flex gap-1 overflow-x-auto pb-2.5">
        {STC_BEATS.map((b) => (
          <div key={b.label} className="min-w-[92px] flex-1 rounded-[10px] bg-paper-2 px-[9px] py-[7px]">
            <div className="font-mono text-[10px] text-accent">p. {b.page}</div>
            <div className="mt-0.5 text-[11px] leading-[1.2] font-semibold text-ink">{b.label}</div>
          </div>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-[14px] text-[11.5px] text-ink/65">
        <span><b className="font-mono">+/−</b> mudança emocional da cena</span>
        <span><b className="font-mono">&gt;&lt;</b> quem contra quem</span>
        <span>cor = trama A / B / C</span>
        <span className="ml-auto font-mono">{cards.length} fichas · a meta clássica é 40</span>
      </div>
      <div className="flex flex-col gap-3">
        {STC_ROWS.map((row, ri) => (
          <div key={row.title} className="flex gap-3 overflow-x-auto rounded-[18px] bg-[#5c3a26] bg-[radial-gradient(rgba(0,0,0,.18)_1px,transparent_1px)] bg-size-[6px_6px] p-3">
            <div className="flex w-[74px] shrink-0 flex-col justify-center text-[#f4e9d8]">
              <div className="font-display text-[15px] uppercase">{row.title}</div>
              <div className="mt-[3px] font-mono text-[10px] opacity-70">{row.pages}</div>
            </div>
            {cards.filter((c) => c.row === ri).map((c) => {
              const sto = STC_STORIES.find((s) => s.id === c.story) ?? STC_STORIES[0]
              return (
                <div key={c.id} className="flex w-[212px] shrink-0 flex-col rounded-[3px] border-t-[7px] bg-paper-2 shadow-[0_8px_16px_-8px_rgba(0,0,0,.6)]" style={{ borderTopColor: sto.color }}>
                  <div className="flex items-center gap-1.5 px-[9px] pt-[7px]">
                    <button type="button" title="Trama — clique pra trocar" onClick={() => upd(c.id, { story: next(STC_STORIES.map((s) => s.id), c.story) })} className="rounded-full px-[7px] py-[3px] text-[9.5px] font-bold uppercase" style={{ background: sto.color, color: sto.ink }}>
                      {sto.label}
                    </button>
                    <button type="button" title="Batida — clique pra trocar" onClick={() => upd(c.id, { beat: next(STC_BEATS.map((b) => b.label), c.beat) })} className="min-w-0 flex-1 truncate text-left text-[10px] text-ink-muted hover:text-ink">
                      {c.beat || '—'}
                    </button>
                    <button type="button" aria-label="Fileira de cima" disabled={c.row === 0} onClick={() => upd(c.id, { row: c.row - 1 })} className="text-ink/45 hover:text-ink disabled:opacity-30"><ChevronUp size={13} /></button>
                    <button type="button" aria-label="Fileira de baixo" disabled={c.row === 3} onClick={() => upd(c.id, { row: c.row + 1 })} className="text-ink/45 hover:text-ink disabled:opacity-30"><ChevronDown size={13} /></button>
                    <button type="button" aria-label="Apagar ficha" onClick={() => setCards((x) => x.filter((y) => y.id !== c.id))} className="text-ink/40 hover:text-accent"><X size={13} /></button>
                  </div>
                  <input value={c.title} onChange={(e) => upd(c.id, { title: e.target.value })} aria-label="Cabeçalho" className="border-0 bg-transparent px-[9px] pt-1.5 pb-0.5 font-script text-[11.5px] font-bold text-ink uppercase outline-none" />
                  <textarea value={c.text} onChange={(e) => upd(c.id, { text: e.target.value })} rows={3} placeholder="o que acontece…" aria-label="Descrição" className="resize-none border-0 bg-transparent px-[9px] py-0.5 font-script text-[12px] leading-[1.35] text-ink outline-none placeholder:text-ink/35" />
                  <div className="mt-auto flex items-center gap-1.5 border-t border-dashed border-rail/20 px-[9px] pt-1.5 pb-2">
                    <button type="button" title="Mudança emocional — clique pra trocar" onClick={() => upd(c.id, { emo: next(STC_EMO, c.emo) })} className="shrink-0 font-mono text-[13px] font-bold" style={{ color: c.emo.endsWith('−') ? '#a8432f' : '#25a244' }}>
                      {c.emo}
                    </button>
                    <span className="shrink-0 font-mono text-[13px] font-bold text-ink">&gt;&lt;</span>
                    <input value={c.conflict} onChange={(e) => upd(c.id, { conflict: e.target.value })} placeholder="quem contra quem" aria-label="Quem contra quem" className="min-w-0 flex-1 border-0 bg-transparent text-[11px] text-ink/75 outline-none" />
                  </div>
                </div>
              )
            })}
            <button type="button" onClick={() => setCards((c) => [...c, { id: uid('c'), row: ri, title: 'INT. ', text: '', emo: '+/−', conflict: '', story: 'A', beat: '' }])} className="flex min-h-[150px] w-[120px] shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[#f4e9d8]/55 text-[12px] font-semibold text-[#f4e9d8] hover:bg-[#f4e9d8]/8">
              + ficha
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
