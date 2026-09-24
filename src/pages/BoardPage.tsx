import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router'
import { PageHeader } from '../components/ui'
import { PHASES } from '../data/constants'
import { useNow } from '../hooks/useNow'
import { epNum } from '../lib/format'
import { isLocked } from '../lib/selectors'
import { useStore } from '../store'

export default function BoardPage() {
  const navigate = useNavigate()
  const docs = useStore((s) => s.docs)
  const episodes = useStore((s) => s.episodes)
  const series = useStore((s) => s.series)
  const now = useNow(60_000)
  const where = (episodeId: string) => {
    const e = episodes.find((x) => x.id === episodeId)
    const s = e && series.find((x) => x.id === e.serieId)
    return e && s ? `${s.title} · ep. ${epNum(e.num)}` : 'sem vínculo'
  }

  return (
    <div>
      <PageHeader title="Quadro geral" sub="Todos os textos de todas as histórias, por fase." />
      <div className="flex gap-4 overflow-x-auto pb-[14px]">
        {PHASES.map((p) => {
          const cards = docs.filter((d) => d.phase === p.id).sort((a, b) => b.updatedAt - a.updatedAt)
          return (
            <section key={p.id} className="w-[250px] shrink-0 rounded-[24px] bg-paper/50 p-[14px]">
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-[12.5px] font-bold text-ink">{p.title}</span>
                <span className="ml-auto font-mono text-[11.5px] text-ink-muted">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {cards.map((d) => (
                  <button key={d.id} type="button" onClick={() => navigate('/texto/' + d.id)} className="rounded-[16px] bg-paper-2 px-[14px] py-[13px] text-left shadow-[0_10px_22px_-16px_rgba(35,18,9,.8)] hover:-translate-y-0.5">
                    <span className="block font-serif text-[19px] leading-[1.15] text-ink">{d.title}</span>
                    <span className="mt-[5px] flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      {isLocked(d, now) && <Lock size={11} />}
                      {where(d.episodeId)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
