import { useNavigate } from 'react-router'
import { PageHeader, PrimaryButton } from '../components/ui'
import { useStore } from '../store'

export default function SeriesPage() {
  const series = useStore((s) => s.series)
  const episodes = useStore((s) => s.episodes)
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
      <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[26px] p-0">
        {series.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => navigate('/h/' + s.id)} className="w-full rounded-card bg-paper p-5 text-left shadow-card">
              <div className="font-serif text-[28px] leading-[1.05]">{s.title}</div>
              <div className="mt-1 text-[12px] text-ink/60">
                {s.kind} · {episodes.filter((e) => e.serieId === s.id).length} episódios
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
