import { Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { BackLink, DashedTile, EntryCard, InlineEdit, Pill, PrimaryButton, sectionTitle } from '../components/ui'
import { PHASES, phaseOf, statusOf } from '../data/constants'
import { epNum, plural } from '../lib/format'
import { serieEpisodes } from '../lib/selectors'
import { useSerie, useStore } from '../store'
import type { Episode, SerieKind } from '../types'
import NotFound from './NotFound'

const KINDS: SerieKind[] = ['Série', 'Longa', 'Curta']

export default function SeriePage() {
  const { serieId = '' } = useParams()
  const navigate = useNavigate()
  const serie = useSerie(serieId)
  const episodes = useStore(useShallow((s) => serieEpisodes(s, serieId)))
  const ideas = useStore(useShallow((s) => s.ideas.filter((i) => i.serieId === serieId)))
  const previstos = useStore((s) => s.plans[serieId]?.previstos ?? 0)
  const progress = useStore(useShallow((s) => {
    const epIds = new Set(s.episodes.filter((e) => e.serieId === serieId).map((e) => e.id))
    return PHASES.map((p) => s.docs.filter((d) => epIds.has(d.episodeId) && d.phase === p.id).length)
  }))
  const { updateSerie, addEpisode, deleteSerie } = useStore.getState()

  if (!serie) return <NotFound />
  const newEpisode = () => navigate(`/h/${serieId}/ep/${addEpisode(serieId).id}`)
  const cycleKind = () => updateSerie(serieId, { kind: KINDS[(KINDS.indexOf(serie.kind) + 1) % KINDS.length] })

  return (
    <div>
      <BackLink to="/" label="Histórias" />
      <header className="mb-6">
        <h1 className="m-0 font-serif text-[56px] leading-none font-normal text-ink">
          <InlineEdit value={serie.title} onSave={(title) => updateSerie(serieId, { title })} />
        </h1>
        <p className="mt-2 mb-0 text-[14px] text-ink-soft">
          <button type="button" onClick={cycleKind} title="Trocar tipo (Série, Longa, Curta)" className="rounded-md underline decoration-dotted underline-offset-4 hover:text-ink">
            {serie.kind}
          </button>{' '}
          · {plural(episodes.length, 'episódio', 'episódios')} · {plural(ideas.length, 'ideia solta', 'ideias soltas')}
        </p>
      </header>

      <div className="mb-[34px] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        <EntryCard
          title="Ideação da história"
          desc="Tudo que ainda não tem episódio: e se, reviravoltas, mundo, personagens."
          foot={`${plural(ideas.length, 'ideia', 'ideias')} · ${ideas.filter((i) => i.pinned).length} destacadas`}
          bg="#7b3fe4" ink="#fdf6e8" inkSoft="rgba(253,246,232,.82)" ghost="rgba(253,246,232,.13)" glyph="?"
          onClick={() => navigate(`/h/${serieId}/ideias`)}
        />
        <EntryCard
          title="Planejamento da história"
          desc="O desenho da série: premissa, arcos e a grade de episódios — o que é canônico e o que ainda é palpite."
          foot={plural(previstos, 'episódio previsto', 'episódios previstos')}
          bg="#a8432f" ink="#fff1e4" inkSoft="rgba(255,241,228,.85)" ghost="rgba(255,241,228,.14)" glyph="#"
          onClick={() => navigate(`/h/${serieId}/plano`)}
        />
        <div className="relative overflow-hidden rounded-[24px] bg-paper p-[22px] shadow-[0_20px_42px_-22px_rgba(35,18,9,.6)]">
          <div className="font-display text-[17px] text-ink uppercase">Onde a história está</div>
          <div className="mt-[9px] mb-[10px] h-0.5 w-[30px] bg-accent" />
          <div className="mt-3 flex flex-col gap-[7px]">
            {PHASES.map((p, i) => progress[i] > 0 && (
              <div key={p.id} className="flex items-center gap-[9px] text-[12.5px] text-ink/80">
                <span className="size-[9px] rounded-full" style={{ background: p.color }} />
                <span>{p.title}</span>
                <span className="ml-auto font-mono text-[11.5px] text-ink-muted">{progress[i]}</span>
              </div>
            ))}
            {progress.every((n) => !n) && <div className="text-[12.5px] text-ink-muted">Nenhum texto ainda.</div>}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-5">
        <h2 className={sectionTitle}>Episódios</h2>
        <PrimaryButton small onClick={newEpisode}>Novo episódio</PrimaryButton>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {episodes.map((e) => <EpisodeCard key={e.id} ep={e} />)}
        <DashedTile label="Novo episódio" onClick={newEpisode} className="min-h-[120px]" />
      </div>

      <div className="mt-14 flex justify-end">
        <button
          type="button"
          onClick={() => { if (confirm(`Apagar "${serie.title}" com todos os episódios, textos e ideias? Não dá pra desfazer.`)) { deleteSerie(serieId); navigate('/') } }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold text-ink/60 hover:bg-paper/30 hover:text-ink"
        >
          <Trash2 size={14} /> Apagar história
        </button>
      </div>
    </div>
  )
}

function EpisodeCard({ ep }: { ep: Episode }) {
  const navigate = useNavigate()
  const docCount = useStore((s) => s.docs.filter((d) => d.episodeId === ep.id).length)
  const p = phaseOf(ep.phase)
  const st = statusOf(ep.status)
  return (
    <button
      type="button"
      onClick={() => navigate(`/h/${ep.serieId}/ep/${ep.id}`)}
      className={`flex gap-4 rounded-[24px] bg-paper p-[18px] text-left shadow-card hover:bg-paper-2 ${ep.status === 'cut' ? 'opacity-45' : ''}`}
    >
      <span className="flex size-[54px] shrink-0 items-center justify-center rounded-[16px] font-display text-[18px]" style={{ background: p.color, color: p.ink }}>
        {epNum(ep.num)}
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-[24px] leading-[1.1] text-ink">{ep.title}</span>
        <span className="mt-1.5 mb-2.5 block text-[12.5px] leading-[1.4] text-ink/65">{ep.logline || 'Sem logline ainda.'}</span>
        <span className="flex flex-wrap items-center gap-2">
          <Pill bg={p.color} fg={p.ink}>{p.title}</Pill>
          <Pill bg={st.bg} fg={st.fg}>{st.label}</Pill>
          <span className="font-mono text-[11px] text-ink-muted">{plural(docCount, 'texto', 'textos')}</span>
        </span>
      </span>
    </button>
  )
}
