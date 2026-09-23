import { Check } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { Clock } from '../components/Clock'
import { DocCard } from '../components/DocCard'
import { BackLink, DashedTile, PrimaryButton } from '../components/ui'
import { formatForPhase, PHASES, phaseOf } from '../data/constants'
import { useNow } from '../hooks/useNow'
import { capitalize, countdown, epNum } from '../lib/format'
import { useEpisode, useSerie, useStore } from '../store'
import NotFound from './NotFound'

export default function PhasePage() {
  const { serieId = '', epId = '', phaseId = '' } = useParams()
  const navigate = useNavigate()
  const serie = useSerie(serieId)
  const ep = useEpisode(epId)
  const docs = useStore(useShallow((s) => s.docs.filter((d) => d.episodeId === epId && d.phase === phaseId).sort((a, b) => a.createdAt - b.createdAt)))
  const { addDoc, updateEpisode } = useStore.getState()
  const now = useNow()

  if (!serie || !ep || !PHASES.some((p) => p.id === phaseId)) return <NotFound />
  const phase = phaseOf(phaseId)
  const isCurrent = ep.phase === phase.id
  const newDoc = () => {
    const doc = addDoc(epId, phase.id, { title: `${capitalize(phase.noun)} — tentativa ${docs.length + 1}`, format: formatForPhase(phase.id) })
    navigate('/texto/' + doc.id)
  }
  const lockTimes = docs.map((d) => d.lockedUntil ?? 0).filter((t) => t > now)
  const clock = lockTimes.length ? countdown(Math.min(...lockTimes), now) : null

  return (
    <div className="max-w-[1040px]">
      <BackLink to={`/h/${serieId}/ep/${epId}`} label={`ep. ${epNum(ep.num)} — ${ep.title}`} />
      <header className="mb-[22px] flex items-end justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-block rounded-full px-3 py-1.5 text-[10.5px] font-bold tracking-[.1em] uppercase" style={{ background: phase.color, color: phase.ink }}>
            {serie.title} · ep. {epNum(ep.num)} — {ep.title}
          </span>
          <h1 className="mt-2.5 mb-0 font-serif text-[52px] leading-none font-normal text-ink">{phase.title}</h1>
          <p className="mt-2 mb-0 text-[14px] text-ink-soft">{phase.desc}</p>
          <button
            type="button"
            disabled={isCurrent}
            onClick={() => updateEpisode(epId, { phase: phase.id })}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line-strong px-3 py-1 text-[12px] font-semibold text-rail enabled:hover:border-accent enabled:hover:text-accent disabled:border-transparent disabled:bg-paper/50"
          >
            {isCurrent ? <><Check size={13} /> Fase atual do episódio</> : 'Marcar como fase atual do episódio'}
          </button>
        </div>
        <PrimaryButton onClick={newDoc}>Novo {phase.noun}</PrimaryButton>
      </header>

      {clock && (
        <div className="mb-5 flex flex-wrap items-center gap-[22px] rounded-card bg-ph-maturacao p-6 shadow-[0_22px_46px_-22px_rgba(35,18,9,.7)]">
          <div className="min-w-[220px]">
            <div className="text-[11.5px] font-bold tracking-[.12em] text-[#eafaf3]/80 uppercase">trancado</div>
            <div className="mt-1.5 font-serif text-[28px] text-[#eafaf3]">Ninguém lê antes da hora</div>
          </div>
          <Clock parts={[[clock.days, 'dias'], [clock.hours, 'horas'], [clock.min, 'min'], [clock.sec, 'seg']]} />
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {docs.map((d) => <DocCard key={d.id} doc={d} />)}
        <DashedTile label={`Novo ${phase.noun}`} onClick={newDoc} className="min-h-[150px]" />
      </div>
    </div>
  )
}
