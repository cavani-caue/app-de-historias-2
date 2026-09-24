import { useImageDrop } from '../hooks/useImageDrop'
import { useNavigate } from 'react-router'
import { ArtButton, CharacterImg } from '../components/CharacterArt'
import { DashedTile, PageHeader, Pill, PrimaryButton } from '../components/ui'
import { phaseOf } from '../data/constants'
import { ago, plural } from '../lib/format'
import { seriePhase } from '../lib/selectors'
import { useStore } from '../store'
import type { Serie } from '../types'

export default function SeriesPage() {
  const series = useStore((s) => s.series)
  const addSerie = useStore((s) => s.addSerie)
  const navigate = useNavigate()
  const create = () => navigate('/h/' + addSerie().id)

  return (
    <div>
      <PageHeader
        title="Histórias"
        sub="Cada história guarda sua ideação e seus episódios. Passe o mouse — quem mora ali sai do quadro."
        action={<PrimaryButton onClick={create}>Nova história</PrimaryButton>}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[26px] gap-y-[34px]">
        {series.map((s) => <SerieCard key={s.id} serie={s} />)}
        <DashedTile label="Nova história" onClick={create} className="aspect-square rounded-card" />
      </div>
    </div>
  )
}

function SerieCard({ serie }: { serie: Serie }) {
  const navigate = useNavigate()
  const phase = useStore((s) => phaseOf(seriePhase(s.episodes, serie.id)))
  const epCount = useStore((s) => s.episodes.filter((e) => e.serieId === serie.id && e.status !== 'cut').length)
  const coverUrl = useStore((s) => (serie.coverId ? s.imageUrls[serie.coverId] : undefined))
  const setCover = useStore((s) => s.setSerieCover)
  const { over, handlers } = useImageDrop((f) => setCover(serie.id, f))
  const open = () => navigate('/h/' + serie.id)

  const actions = coverUrl
    ? [{ label: 'Trocar personagem', hint: 'PNG com fundo transparente', upload: (f: File) => setCover(serie.id, f) }, { label: 'Remover personagem', run: () => setCover(serie.id, null) }]
    : [{ label: 'Enviar personagem', upload: (f: File) => setCover(serie.id, f) }]

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open() }}
      {...handlers}
      className="group relative z-[1] cursor-pointer outline-none hover:z-30 focus-visible:z-30"
    >
      <div className={`rounded-card bg-paper px-3 pt-3 pb-4 shadow-[0_20px_40px_-18px_rgba(35,18,9,.6)] ${over ? 'ring-4 ring-gold' : ''} group-focus-visible:ring-4 group-focus-visible:ring-gold`}>
        <div className="relative aspect-[4/3] rounded-cover" style={{ background: phase.color, backgroundImage: `radial-gradient(circle at 50% 58%, ${phase.glow}, transparent 62%)` }}>
          <div className="absolute inset-y-[6%] inset-x-[8%] transition-[translate,scale] duration-[340ms] ease-leak group-hover:-translate-y-[14%] group-hover:scale-130">
            <CharacterImg url={coverUrl} placeholder="só o personagem (PNG)" ink={phase.inkSoft} />
          </div>
          <ArtButton actions={actions} />
        </div>
        <div className="mt-[14px] flex items-end justify-between gap-3 px-1.5">
          <div className="min-w-0">
            <div className="font-serif text-[28px] leading-[1.05] text-ink">{serie.title}</div>
            <div className="mt-1 text-[12px] text-ink/60">
              {serie.kind === 'Série' ? plural(epCount, 'episódio', 'episódios') : serie.kind} · mexida {ago(serie.updatedAt)}
            </div>
          </div>
          <Pill bg={phase.color} fg={phase.ink} className="px-[11px] py-1.5">{serie.kind}</Pill>
        </div>
      </div>
    </div>
  )
}
