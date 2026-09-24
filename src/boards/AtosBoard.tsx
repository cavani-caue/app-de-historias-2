import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { ACT_NAMES, ATOS, ATOS_TICKS } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { epNum, pad2 } from '../lib/format'
import { serieEpisodes } from '../lib/selectors'
import { useStore } from '../store'
import type { BoardProps } from './BoardView'
import { Meta, ruled, Stepper } from './common'

/** Estrela/hexágono: polígono com `n` pontas alternando raios r1 e r2. */
const burst = (x: number, y: number, r1: number, r2: number, n: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n
    const r = i % 2 ? r2 : r1
    return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`
  }).join(' ')

export default function AtosBoard({ planKey, serieId, epId }: BoardProps) {
  const [params] = useSearchParams()
  const [sel, setSel] = useState(() => Math.min(ATOS.length - 1, Math.max(0, Number(params.get('sel') ?? 0) || 0)))
  const [plan, setPlan] = usePlan(planKey)
  const eps = useStore(useShallow((s) => serieEpisodes(s, serieId)))
  const notes = plan.atos
  const cur = notes[sel] ?? { note: '' }
  const setCur = (patch: Partial<{ note: string; ep?: string }>) => setPlan((p) => ({ atos: { ...p.atos, [sel]: { ...(p.atos[sel] ?? { note: '' }), ...patch } } }))
  const linked = eps.find((e) => e.id === cur.ep)
  const cycleEp = () => {
    const ids: (string | undefined)[] = [undefined, ...eps.map((e) => e.id)]
    setCur({ ep: ids[(ids.indexOf(cur.ep) + 1) % ids.length] })
  }

  return (
    <div className="flex flex-wrap items-start gap-[18px]">
      <div className="min-w-0 flex-[3_1_560px] rounded-[18px] bg-paper-2 px-3 pt-[14px] pb-1.5">
        <div className="relative aspect-[1000/430] w-full">
          <svg viewBox="0 0 1000 430" className="absolute inset-0 block size-full font-serif" role="img" aria-label="Linha do tempo em 3 atos">
            <line x1="20" y1="360" x2="990" y2="360" stroke="#2a1b12" strokeWidth="2" />
            <line x1="300" y1="60" x2="300" y2="428" stroke="#2a1b12" strokeWidth="1.5" />
            <line x1="545" y1="245" x2="545" y2="360" stroke="#2a1b12" strokeWidth="1.2" strokeDasharray="4 5" />
            <line x1="795" y1="40" x2="795" y2="428" stroke="#2a1b12" strokeWidth="1.5" />
            <polyline points="40,360 795,160 975,360" fill="none" stroke="#2a1b12" strokeWidth="13" strokeLinejoin="miter" />
            <text x="395" y="300" transform="rotate(-14.8 395 300)" fontSize="18" fontStyle="italic" fill="#2a1b12">ação ascendente</text>
            {[[170, 'Ato 1', 'preparação'], [547, 'Ato 2', 'confronto'], [892, 'Ato 3', 'resolução']].map(([x, a, b]) => (
              <g key={a as string}>
                <text x={x} y="394" textAnchor="middle" fontSize="26" fill="#2a1b12">{a}</text>
                <text x={x} y="418" textAnchor="middle" fontSize="15" fill="#6b5a4e">{b}</text>
              </g>
            ))}
            {ATOS.map((b, i) => {
              const on = i === sel
              const filled = !!(notes[i]?.note ?? '').trim() || !!notes[i]?.ep
              return (
                <g key={i} onClick={() => setSel(i)} className="cursor-pointer">
                  <line x1={b.x} y1={b.y} x2={b.x} y2={b.y - ATOS_TICKS[i]} stroke="#2a1b12" strokeWidth="1.5" />
                  <polygon points={b.star ? burst(b.x, b.y, 19, 9, 8) : burst(b.x, b.y, 8, 8, 6)} fill={on ? '#a8432f' : filled ? '#2a1b12' : '#fffdf7'} stroke="#2a1b12" strokeWidth="2" />
                </g>
              )
            })}
          </svg>
          {ATOS.map((b, i) => {
            const on = i === sel
            const tickTop = b.y - ATOS_TICKS[i]
            const leftOf = i === 3 || i === 10 || i === 13
            const startOf = i === 0 || i === 11
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={on}
                className="absolute w-max max-w-[110px] font-serif text-[clamp(10px,1.35vw,15px)] leading-[1.05]"
                style={{
                  left: `${b.x / 10 - (i === 3 || i === 10 ? 0.6 : 0)}%`,
                  top: `${(tickTop - 4) / 4.3}%`,
                  translate: `${startOf ? '0%' : leftOf ? '-100%' : '-50%'} -100%`,
                  textAlign: startOf ? 'left' : leftOf ? 'right' : 'center',
                  fontWeight: on ? 700 : 400,
                  color: on ? '#a8432f' : '#2a1b12',
                }}
              >
                {b.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-w-0 flex-[1_1_260px] rounded-[18px] bg-paper-2 p-[18px]">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[28px] text-accent">{pad2(sel + 1)}</span>
          <span className="text-[10.5px] font-bold tracking-[.1em] text-ink-muted uppercase">{ACT_NAMES[ATOS[sel].act]}</span>
          <Stepper onPrev={() => setSel((sel + ATOS.length - 1) % ATOS.length)} onNext={() => setSel((sel + 1) % ATOS.length)} />
        </div>
        <div className="mt-1 mb-3 font-serif text-[27px] text-ink">{ATOS[sel].label}</div>
        <textarea value={cur.note} onChange={(e) => setCur({ note: e.target.value })} rows={6} placeholder="O que acontece aqui na sua história?" className={ruled} />
        {!epId && (
          <button type="button" onClick={cycleEp} title="Clique pra trocar o episódio" className="mt-2.5 inline-block rounded-full border-[1.5px] border-line-strong px-[13px] py-[7px] text-[12px] font-semibold text-rail hover:border-accent hover:text-accent">
            {linked ? `ep. ${epNum(linked.num)} — ${linked.title}` : 'ligar a um episódio'}
          </button>
        )}
        <Meta className="mt-3 text-[11px]">{ATOS.filter((_, i) => (notes[i]?.note ?? '').trim()).length} de {ATOS.length} pontos preenchidos</Meta>
      </div>
    </div>
  )
}
