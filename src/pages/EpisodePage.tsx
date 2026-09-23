import { Trash2 } from 'lucide-react'
import { useImageDrop } from '../hooks/useImageDrop'
import { useNavigate, useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { ArtButton, CharacterImg, type ArtAction } from '../components/CharacterArt'
import { BackLink, EntryCard, InlineEdit, Pill } from '../components/ui'
import { PHASES, STATUSES, statusOf, type PhaseDef } from '../data/constants'
import { useNow } from '../hooks/useNow'
import { countdown, epNum, plural, shortLeft } from '../lib/format'
import { phaseArtUrl } from '../lib/selectors'
import { useEpisode, useSerie, useStore } from '../store'
import type { Episode } from '../types'
import NotFound from './NotFound'

export default function EpisodePage() {
  const { serieId = '', epId = '' } = useParams()
  const navigate = useNavigate()
  const serie = useSerie(serieId)
  const ep = useEpisode(epId)
  const plan = useStore((s) => s.plans['ep:' + epId])
  const { updateEpisode, updatePlan, deleteEpisode } = useStore.getState()

  if (!serie || !ep || ep.serieId !== serieId) return <NotFound />
  const st = statusOf(ep.status)
  const base = `/h/${serieId}/ep/${epId}`
  const cycleStatus = () => updateEpisode(epId, { status: STATUSES[(STATUSES.findIndex((s) => s.id === ep.status) + 1) % STATUSES.length].id })

  return (
    <div>
      <BackLink to={'/h/' + serieId} label={serie.title} />
      <header className="mb-[26px]">
        <h1 className="m-0 flex items-baseline gap-3 font-serif text-[52px] leading-none font-normal text-ink">
          <span className="shrink-0">ep. {epNum(ep.num)} —</span>
          <InlineEdit value={ep.title} onSave={(title) => updateEpisode(epId, { title })} />
        </h1>
        <p className="mt-2 mb-0 text-[14px] text-ink-soft">As fases deste episódio. Cada fase guarda quantos textos você quiser — dá pra ter três vomit drafts e escolher um depois.</p>
      </header>

      <div className="mb-[34px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <div className="rounded-[24px] bg-paper p-5 shadow-card">
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="label-caps">Pergunta dramática do episódio</span>
            <Pill bg={st.bg} fg={st.fg} onClick={cycleStatus} title={`${st.desc} Clique para trocar.`} className="ml-auto px-[11px]">{st.label}</Pill>
          </div>
          <textarea
            value={plan?.pergunta ?? ''}
            onChange={(e) => updatePlan('ep:' + epId, { pergunta: e.target.value })}
            rows={3}
            placeholder="O que este episódio pergunta — e responde no fim?"
            className="w-full resize-y border-0 bg-transparent font-serif text-[21px] leading-[1.3] text-ink italic outline-none placeholder:text-ink/35"
          />
          <div className="mt-2.5 border-t border-line pt-2.5 text-[12.5px] text-ink/60">
            <InlineEdit multiline value={ep.logline} placeholder="Logline: o episódio numa frase." onSave={(logline) => updateEpisode(epId, { logline })} />
          </div>
        </div>
        <EntryCard
          title="Brainstorming"
          desc="Abre a parede infinita do episódio em tela cheia: post-its, desenho, grupos."
          foot={plural(plan?.wall.notes.length ?? 1, 'post-it', 'post-its')}
          bg="#7b3fe4" ink="#fdf6e8" inkSoft="rgba(253,246,232,.85)" ghost="rgba(253,246,232,.13)" glyph="!"
          onClick={() => navigate(`${base}/plano?quadro=postits&tela=cheia`)}
        />
        <EntryCard
          title="Planejamento do episódio"
          desc="Anatomia, escaleta, linha do tempo em 3 atos, fichas Save the Cat."
          foot={plural(plan?.escaleta.length ?? 0, 'cena na escaleta', 'cenas na escaleta')}
          bg="#a8432f" ink="#fff1e4" inkSoft="rgba(255,241,228,.85)" ghost="rgba(255,241,228,.14)" glyph="#"
          onClick={() => navigate(`${base}/plano`)}
        />
      </div>

      <h2 className="mt-0 mb-[14px] font-serif text-[30px] font-normal text-ink">Fases do episódio</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-x-6 gap-y-10">
        {PHASES.map((p) => <PhaseCard key={p.id} phase={p} ep={ep} />)}
      </div>

      <div className="mt-14 flex justify-end">
        <button
          type="button"
          onClick={() => { if (confirm(`Apagar o episódio "${ep.title}" e todos os textos dele? Não dá pra desfazer.`)) { deleteEpisode(epId); navigate('/h/' + serieId) } }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold text-ink/60 hover:bg-paper/30 hover:text-ink"
        >
          <Trash2 size={14} /> Apagar episódio
        </button>
      </div>
    </div>
  )
}

function PhaseCard({ phase: p, ep }: { phase: PhaseDef; ep: Episode }) {
  const navigate = useNavigate()
  const now = useNow()
  const base = `/h/${ep.serieId}/ep/${ep.id}`
  const docs = useStore(useShallow((s) => s.docs.filter((d) => d.episodeId === ep.id && d.phase === p.id)))
  const plan = useStore((s) => s.plans['ep:' + ep.id])
  const artUrl = useStore((s) => phaseArtUrl(s, p.id, ep.serieId))
  const overrideKey = `${ep.serieId}:${p.id}`
  const hasOverride = useStore((s) => !!s.phaseArt[overrideKey])
  const hasDefault = useStore((s) => !!s.phaseArt[p.id])
  const setPhaseArt = useStore((s) => s.setPhaseArt)
  const { over, handlers } = useImageDrop((f) => setPhaseArt(p.id, f))

  const status =
    p.id === 'brainstorm' ? plural(plan?.wall.notes.length ?? 1, 'post-it', 'post-its')
    : p.id === 'plan' ? plural(plan?.escaleta.length ?? 0, 'cena na escaleta', 'cenas na escaleta')
    : docs.length ? plural(docs.length, 'texto', 'textos') : 'vazia'
  const lockTimes = docs.map((d) => d.lockedUntil ?? 0).filter((t) => t > now)
  const lock = lockTimes.length ? countdown(Math.min(...lockTimes), now) : null

  const open = () => {
    if (p.id === 'brainstorm') navigate(`${base}/plano?quadro=postits&tela=cheia`)
    else if (p.id === 'plan') navigate(`${base}/plano`)
    else navigate(`${base}/fase/${p.id}`)
  }

  const actions: ArtAction[] = [
    { label: 'Personagem para todas as histórias', hint: `padrão de "${p.title}"`, upload: (f) => setPhaseArt(p.id, f) },
    { label: 'Só nesta história', hint: 'substitui o padrão aqui', upload: (f) => setPhaseArt(overrideKey, f) },
  ]
  if (hasOverride) actions.push({ label: 'Voltar ao padrão da fase', run: () => setPhaseArt(overrideKey, null) })
  else if (hasDefault) actions.push({ label: 'Remover o padrão da fase', run: () => setPhaseArt(p.id, null) })

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open() }}
      {...handlers}
      className="group relative z-[1] aspect-[24/37] cursor-pointer outline-none hover:z-30 focus-visible:z-30"
    >
      <div
        className={`absolute inset-0 overflow-hidden rounded-phase ${over ? 'ring-4 ring-gold' : ''}`}
        style={{ background: p.color, boxShadow: `0 22px 46px -16px rgba(35,18,9,.65), 0 0 0 7px ${p.halo}` }}
      >
        <div className="absolute right-3 -bottom-[18px] font-display text-[124px] leading-none" style={{ color: p.ghost }}>{p.num}</div>
        <div className="absolute top-[34%] left-1/2 -ml-[59px] size-[118px] rounded-full border-[10px]" style={{ borderColor: p.ghost }} />
        <div className="absolute top-[52%] left-1/2 -ml-8 h-2.5 w-16 rounded-md" style={{ background: p.ghost }} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col justify-between px-[18px] pt-4 pb-5">
        <div className="flex flex-col items-start gap-2">
          <span className="rounded-full px-[11px] py-[5px] text-[10.5px] font-bold tracking-[.1em] uppercase" style={{ background: p.chipBg, color: p.ink }}>{status}</span>
          {lock && <span className="rounded-[12px] px-3 py-1.5 font-mono text-[19px] font-bold" style={{ background: p.chipBg, color: p.ink }}>{shortLeft(lock)}</span>}
        </div>
        <div>
          <div className="font-display text-[20px] leading-[1.05] uppercase" style={{ color: p.ink }}>{p.title}</div>
          <div className="mt-[9px] mb-2.5 h-0.5 w-[34px]" style={{ background: p.rule }} />
          <p className="m-0 text-[12.5px] leading-[1.4]" style={{ color: p.inkSoft }}>{p.desc}</p>
        </div>
      </div>
      <div className="absolute inset-x-[8%] top-[14%] bottom-[26%] z-[3] transition-[translate,scale] duration-[340ms] ease-leak group-hover:-translate-y-[16%] group-hover:scale-142">
        <CharacterImg url={artUrl} placeholder={`personagem de "${p.title}" (PNG) — solte aqui ou use o botão`} ink={p.inkSoft} subtle />
      </div>
      <ArtButton actions={actions} ink={p.ink} bg={p.chipBg} />
    </div>
  )
}
