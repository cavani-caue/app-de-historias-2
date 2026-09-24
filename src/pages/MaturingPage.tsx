import { Clock3, Unlock } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '../components/ui'
import { DURATIONS } from '../data/constants'
import { useNow } from '../hooks/useNow'
import { countdown, pad2, shortLeft } from '../lib/format'
import { docMeta, docPlace, isLocked } from '../lib/selectors'
import { useStore } from '../store'
import type { Doc } from '../types'

const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
const toInputDate = (ts: number) => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) }

export default function MaturingPage() {
  const now = useNow()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const state = useStore()
  const { docs, lockDoc, unlockDoc, showToast } = state
  const locked = docs.filter((d) => isLocked(d, now)).sort((a, b) => (a.lockedUntil ?? 0) - (b.lockedUntil ?? 0))
  const picked = docs.find((d) => d.id === params.get('doc'))
  const main: Doc | undefined = picked ?? locked[0]
  const others = locked.filter((d) => d.id !== main?.id)
  const [customOpen, setCustomOpen] = useState(false)
  const [custom, setCustom] = useState(() => toInputDate(Date.now() + 14 * 864e5))

  const send = (until: number) => {
    if (!main) return
    if (until <= Date.now()) { showToast('Escolha uma data no futuro.'); return }
    lockDoc(main.id, until)
    setCustomOpen(false)
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {})
    showToast(`"${main.title}" trancado até ${fmtDate(until)}.`)
  }

  const peek = (d: Doc) => {
    if (confirm('Ler agora quebra a maturação: a ideia é voltar com a cabeça fria. Abrir mesmo assim (só leitura)?')) navigate(`/texto/${d.id}?espiar=1`)
  }

  const mainLocked = main ? isLocked(main, now) : false
  const c = main?.lockedUntil ? countdown(main.lockedUntil, now) : null
  const total = main?.lockedUntil && main.lockedAt ? main.lockedUntil - main.lockedAt : 0
  const progress = total > 0 && main?.lockedAt ? Math.min(1, Math.max(0, (now - main.lockedAt) / total)) : 0

  return (
    <div className="max-w-[1060px]">
      <PageHeader title="Maturando" sub="O texto fica longe dos seus olhos até o relógio zerar. Cabeça fria enxerga o que a pressa não vê." />

      <div className="grid items-start gap-[22px] lg:grid-cols-[1.1fr_.9fr]">
        {main ? (
          <div className="rounded-[30px] bg-ph-maturacao p-7 shadow-[0_24px_50px_-20px_rgba(35,18,9,.7)]">
            <div className="flex items-center gap-2.5 text-[#eafaf3]">
              {mainLocked ? <Clock3 size={20} /> : <Unlock size={20} />}
              <span className="text-[12px] font-bold tracking-[.12em] uppercase">{mainLocked ? 'trancado' : main.lockedAt ? 'destrancado' : 'ainda não mandado'}</span>
            </div>
            <div className="mt-[14px] mb-0.5 font-serif text-[34px] leading-[1.1] text-[#eafaf3]">{main.title}</div>
            <div className="text-[13px] text-[#eafaf3]/75">
              {docPlace(state, main)}
              {main.lockedAt ? ` · guardado em ${fmtDate(main.lockedAt)}` : ''}
            </div>

            {mainLocked && c ? (
              <>
                <div className="mt-[26px] mb-[22px] flex gap-[14px]">
                  {([[c.days, 'dias'], [c.hours, 'horas'], [c.min, 'min'], [c.sec, 'seg']] as const).map(([v, l]) => (
                    <div key={l} className="flex-1 rounded-[18px] bg-[rgba(2,28,24,.32)] py-[14px] text-center">
                      <div className="font-mono text-[30px] font-bold text-[#eafaf3]">{pad2(v)}</div>
                      <div className="mt-1 text-[10px] tracking-[.12em] text-[#eafaf3]/70 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(2,28,24,.3)]" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-[#7fe0c4] transition-[width] duration-1000" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0 text-[12px] text-[#eafaf3]/70">Destrava sozinho em {fmtDate(main.lockedUntil!)}. Você recebe um aviso.</span>
                  <span className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => { if (confirm('Destrancar agora? O relógio para e o texto volta a abrir normalmente.')) unlockDoc(main.id) }} className="rounded-full px-3 py-[9px] text-[12px] font-semibold text-[#eafaf3]/80 hover:text-[#eafaf3] hover:underline">
                      destrancar agora
                    </button>
                    <button type="button" onClick={() => peek(main)} className="rounded-full border-[1.5px] border-[#eafaf3]/45 px-4 py-[9px] text-[12.5px] font-semibold whitespace-nowrap text-[#eafaf3] hover:bg-[#eafaf3]/14">
                      Ver mesmo assim
                    </button>
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] text-[#eafaf3]/80">{main.lockedAt ? 'Pronto pra reler com a cabeça fria.' : 'Escolha ao lado por quanto tempo ele some.'}</span>
                <Link to={'/texto/' + main.id} className="rounded-full bg-[#eafaf3] px-4 py-[9px] text-[12.5px] font-bold text-ph-maturacao! hover:bg-white">Abrir texto</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[30px] bg-ph-maturacao p-7 text-[#eafaf3]">
            <div className="font-serif text-[30px]">Nada maturando agora.</div>
            <p className="mt-2 text-[13px] text-[#eafaf3]/80">Abra um texto e use "Mandar maturar" na barra de cima.</p>
          </div>
        )}

        <div className="rounded-[30px] bg-paper p-[22px] shadow-[0_20px_42px_-22px_rgba(35,18,9,.6)]">
          <div className="mb-3 label-caps">{main ? (mainLocked ? 'Trancar de novo por' : 'Mandar maturar por') : 'Mandar maturar por'}</div>
          <div className="flex flex-col gap-2">
            {DURATIONS.map((d, i) => (
              <button
                key={d.label}
                type="button"
                disabled={!main}
                onClick={() => send(Date.now() + d.ms)}
                className="flex items-center justify-between gap-2.5 rounded-[16px] px-4 py-[13px] text-left text-[14px] font-semibold disabled:opacity-50"
                style={i === 1 ? { background: '#0f6e63', color: '#eafaf3' } : { background: 'rgba(58,35,24,.08)', color: '#2a1b12' }}
              >
                <span>{d.label}</span>
                <span className="text-[12px] font-medium opacity-72">{d.hint}</span>
              </button>
            ))}
            <button type="button" disabled={!main} onClick={() => setCustomOpen((o) => !o)} aria-expanded={customOpen} className="flex items-center justify-between rounded-[16px] bg-rail/8 px-4 py-[13px] text-left text-[14px] font-semibold text-ink disabled:opacity-50">
              Escolher data…
            </button>
            {customOpen && (
              <div className="flex items-center gap-2 rounded-[16px] bg-paper-2 p-3">
                <input type="date" value={custom} min={toInputDate(now + 864e5)} onChange={(e) => setCustom(e.target.value)} aria-label="Data de liberação" className="flex-1 rounded-[10px] border border-line-strong bg-transparent px-2.5 py-2 text-[13px]" />
                <button type="button" onClick={() => { const [y, m, d] = custom.split('-').map(Number); send(new Date(y, m - 1, d, 9, 0).getTime()) }} className="rounded-full bg-ph-maturacao px-4 py-2 text-[12.5px] font-bold text-[#eafaf3]">Trancar</button>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-line-strong/70 pt-[18px]">
            <div className="mb-2.5 label-caps">Também maturando</div>
            {others.map((d) => (
              <button key={d.id} type="button" onClick={() => setParams({ doc: d.id })} className="flex w-full items-center justify-between gap-2.5 py-[9px] text-left text-[13.5px] text-ink hover:text-accent">
                <span className="min-w-0 truncate">{d.title}</span>
                <span className="font-mono text-[12.5px] text-ink/60">{shortLeft(countdown(d.lockedUntil!, now))}</span>
              </button>
            ))}
            {!others.length && <div className="text-[12.5px] text-ink-muted">Nenhum outro.</div>}
          </div>
          {main && !mainLocked && <div className="mt-3 text-[11.5px] text-ink-muted">{docMeta(main, now)}</div>}
        </div>
      </div>
    </div>
  )
}
