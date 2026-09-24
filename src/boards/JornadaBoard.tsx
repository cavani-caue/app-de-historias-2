import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { JOURNEY } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { epNum, pad2 } from '../lib/format'
import { scopeGaps } from '../lib/selectors'
import { useStore } from '../store'
import type { BoardProps } from './BoardView'
import { ruled, Stepper } from './common'

const angle = (i: number) => ((-105 + i * 30) * Math.PI) / 180

export default function JornadaBoard({ planKey, serieId, epId }: BoardProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [sel, setSel] = useState(() => Math.min(11, Math.max(0, Number(params.get('sel') ?? 0) || 0)))
  const [plan, setPlan] = usePlan(planKey)
  const docs = useStore((s) => s.docs)
  const episodes = useStore((s) => s.episodes)
  const gaps = useMemo(() => scopeGaps(docs, episodes, serieId, epId), [docs, episodes, serieId, epId])
  const notes = plan.journeyNotes
  const has = (i: number) => !!(notes[i] ?? '').trim()
  const gapsAt = (i: number) => gaps.filter((g) => g.stage === i)
  const selGaps = gapsAt(sel)
  const below = (i: number) => Math.sin(angle(i)) > 0

  return (
    <div className="flex flex-wrap items-center gap-[26px]">
      <div className="relative mx-auto my-2.5 aspect-square max-w-[600px] flex-[1_1_440px]" role="group" aria-label="Jornada do herói">
        <div className="absolute inset-[20%] rounded-full shadow-[inset_0_0_0_3px_#2a1b12,0_24px_50px_-24px_rgba(35,18,9,.7)]" style={{ background: 'linear-gradient(180deg,#f7ecdc 0 50%,#1e1b18 50% 100%)' }} />
        <div className="absolute top-1/2 right-[14%] left-[14%] h-0 border-t-2 border-dashed border-accent" />
        <div className="absolute top-[38%] left-1/2 -translate-1/2 text-center font-display text-[12px] tracking-[.14em] text-ink uppercase">Mundo comum</div>
        <div className="absolute top-[62%] left-1/2 -translate-1/2 text-center font-display text-[12px] tracking-[.14em] text-[#f4e9d8] uppercase">Mundo especial</div>
        <div className="absolute top-1/2 right-0 -translate-y-[130%] font-mono text-[10px] tracking-[.08em] text-accent uppercase">limiar</div>
        {JOURNEY.map((label, i) => {
          const a = angle(i)
          const on = i === sel
          const dark = below(i)
          const filled = has(i)
          const n = gapsAt(i).length
          const cos = Math.cos(a)
          const size = on ? 58 : 46
          return (
            <div key={i}>
              <button
                type="button"
                aria-label={`${pad2(i + 1)} ${label}`}
                aria-pressed={on}
                onClick={() => setSel(i)}
                className="absolute z-[2] flex -translate-1/2 items-center justify-center rounded-full border-[2.5px] font-display text-[16px] transition-[width,height] duration-150"
                style={{
                  left: `${50 + cos * 30}%`,
                  top: `${50 + Math.sin(a) * 30}%`,
                  width: size,
                  height: size,
                  background: on ? '#a8432f' : filled ? (dark ? '#f4e9d8' : '#2a1b12') : dark ? '#1e1b18' : '#f7ecdc',
                  color: on ? '#fff1e4' : filled ? (dark ? '#1e1b18' : '#f4e9d8') : dark ? '#f4e9d8' : '#2a1b12',
                  borderColor: dark ? '#f4e9d8' : '#2a1b12',
                }}
              >
                {i + 1}
                {n > 0 && (
                  <span className="absolute -top-[7px] -right-[9px] flex h-5 min-w-5 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#8a5a00] bg-[#ffd84a] px-[5px] font-mono text-[10.5px] text-gap-ink" title={`${n} buraco(s) ligados`}>
                    {n}
                  </span>
                )}
                {!filled && n === 0 && <span className="pointer-events-none absolute -inset-[7px] rounded-full border-2 border-dashed border-accent" />}
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setSel(i)}
                className="absolute w-max max-w-[96px] text-[11px] leading-[1.2] font-semibold text-ink"
                style={{
                  left: `${50 + cos * 37}%`,
                  top: `${50 + Math.sin(a) * 37}%`,
                  textAlign: cos > 0.2 ? 'left' : cos < -0.2 ? 'right' : 'center',
                  translate: `${cos > 0.2 ? '0%' : cos < -0.2 ? '-100%' : '-50%'} -50%`,
                }}
              >
                {label}
              </button>
            </div>
          )
        })}
      </div>

      <div className="min-w-0 flex-[1_1_280px] rounded-[20px] bg-paper-2 p-5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[30px] text-accent">{pad2(sel + 1)}</span>
          <span className="text-[10.5px] font-bold tracking-[.1em] text-ink-muted uppercase">{below(sel) ? 'Mundo especial' : 'Mundo comum'}</span>
          <Stepper onPrev={() => setSel((sel + 11) % 12)} onNext={() => setSel((sel + 1) % 12)} />
        </div>
        <div className="mt-1 mb-3 font-serif text-[28px] text-ink">{JOURNEY[sel]}</div>
        <textarea
          value={notes[sel] ?? ''}
          onChange={(e) => setPlan((p) => ({ journeyNotes: { ...p.journeyNotes, [sel]: e.target.value } }))}
          rows={7}
          placeholder="O que acontece nesta etapa na sua história? Qual episódio?"
          className={ruled}
        />
        {!has(sel) && !selGaps.length && <div className="mt-2.5 text-[12px] font-semibold text-accent">Etapa vazia — nenhum texto ou nota ainda.</div>}
        {selGaps.length > 0 && (
          <div className="mt-[14px]">
            <div className="mb-2 text-[11px] font-bold tracking-[.12em] text-[#8a5a00] uppercase">Buracos nesta etapa</div>
            <div className="flex flex-col gap-1.5">
              {selGaps.map((g) => (
                <button key={g.doc.id + g.index} type="button" onClick={() => navigate(`/texto/${g.doc.id}?buraco=${g.index}`)} className="rounded-[12px] border-[1.5px] border-dashed border-gap-line bg-gap-bg px-2.5 py-2 text-left hover:brightness-97">
                  <span className="block text-[12.5px] text-gap-ink italic">{g.text}</span>
                  <span className="mt-[3px] block text-[10.5px] text-gap-ink/70">ep. {epNum(g.ep.num)} · {g.doc.title} — abrir →</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-[14px] flex flex-wrap gap-x-[14px] gap-y-1.5 border-t border-line pt-3 font-mono text-[11px] text-ink/60">
          <span>{JOURNEY.filter((_, i) => has(i)).length} de 12 etapas com anotação</span>
          <span className="text-[#8a5a00]">{gaps.length} buracos nos textos</span>
          <span className="text-accent">{JOURNEY.filter((_, i) => !has(i) && !gapsAt(i).length).length} etapas vazias</span>
          <span>{gaps.filter((g) => g.stage < 0).length} buracos sem etapa</span>
        </div>
      </div>
    </div>
  )
}
