import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { BackLink } from '../components/ui'
import { KINDS, NOTE_COLORS } from '../data/constants'
import { ago, plural } from '../lib/format'
import { useSerie, useStore } from '../store'
import NotFound from './NotFound'

const chip = (active: boolean, idle = 'transparent') =>
  active ? { background: '#2a1b12', color: '#f7ecdc', borderColor: '#2a1b12' } : { background: idle, color: '#3a2318', borderColor: 'rgba(58,35,24,.22)' }

export default function IdeationPage() {
  const { serieId = '' } = useParams()
  const navigate = useNavigate()
  const serie = useSerie(serieId)
  const ideas = useStore(useShallow((s) => s.ideas.filter((i) => i.serieId === serieId)))
  const { addIdea, updateIdea, deleteIdea, addEpisode } = useStore.getState()
  const [draft, setDraft] = useState('')
  const [kind, setKind] = useState(KINDS[0])
  const [filter, setFilter] = useState('Todas')

  if (!serie) return <NotFound />

  const save = () => {
    const text = draft.trim()
    if (!text) return
    addIdea(serieId, { text, kind, color: NOTE_COLORS[ideas.length % NOTE_COLORS.length], rot: ideas.length % 2 ? 1.2 : -1.1 })
    setDraft('')
  }
  const shown = ideas
    .filter((i) => filter === 'Todas' || (filter === 'Destacadas' ? i.pinned : i.kind === filter))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt)

  const promote = (text: string) => {
    const ep = addEpisode(serieId, { title: text.length > 42 ? text.slice(0, 42) + '…' : text, logline: text, status: 'idea' })
    navigate(`/h/${serieId}/ep/${ep.id}`)
  }

  return (
    <div className="max-w-[1000px]">
      <BackLink to={'/h/' + serieId} label={serie.title} />
      <header className="mb-5">
        <h1 className="m-0 font-serif text-[52px] leading-none font-normal text-ink">Ideação da história</h1>
        <p className="mt-2 mb-0 text-[14px] text-ink-soft">Vale para a história inteira, não para um episódio só. Destaque o que quiser puxar depois.</p>
      </header>

      <div className="mb-5 rounded-card bg-paper p-[18px] shadow-[0_18px_38px_-20px_rgba(35,18,9,.6)]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save() }}
          placeholder="Anote antes que escape…"
          aria-label="Nova ideia"
          className="w-full border-0 bg-transparent px-0.5 py-1.5 font-serif text-[24px] text-ink outline-none placeholder:text-ink/35"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className="rounded-full border-[1.5px] px-[13px] py-[7px] text-[12px] font-semibold" style={chip(kind === k)}>
              {k}
            </button>
          ))}
          <button type="button" onClick={save} className="ml-auto rounded-full bg-ink px-[18px] py-[9px] text-[13px] font-semibold text-paper hover:bg-black">Guardar ideia</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['Todas', 'Destacadas', ...KINDS].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className="rounded-full border-[1.5px] px-[15px] py-2 text-[12px] font-semibold" style={chip(filter === f, 'rgba(247,236,220,.55)')}>
            {f}
          </button>
        ))}
        <span className="ml-1.5 text-[12.5px] text-ink/60">{plural(shown.length, 'ideia', 'ideias')}</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-4">
        {shown.map((i) => (
          <div
            key={i.id}
            id={'idea-' + i.id}
            className="group relative rounded-[20px] p-4 transition-[rotate] duration-[180ms] hover:rotate-0!"
            style={{
              background: i.color,
              rotate: `${i.rot}deg`,
              boxShadow: i.pinned ? '0 18px 34px -16px rgba(35,18,9,.75), 0 0 0 3px #2a1b12' : '0 14px 30px -18px rgba(35,18,9,.7)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[.1em] text-ink-muted uppercase">{i.kind}</span>
              <button
                type="button"
                title="Apagar ideia"
                aria-label="Apagar ideia"
                onClick={() => { if (confirm('Apagar esta ideia?')) deleteIdea(i.id) }}
                className="ml-auto flex size-[26px] items-center justify-center rounded-[9px] text-ink/40 opacity-0 group-hover:opacity-100 hover:bg-ink/10 hover:text-ink"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                title={i.pinned ? 'Tirar destaque' : 'Destacar'}
                aria-pressed={i.pinned}
                onClick={() => updateIdea(i.id, { pinned: !i.pinned })}
                className="flex size-[26px] items-center justify-center rounded-[9px]"
                style={{ background: i.pinned ? '#2a1b12' : 'rgba(42,27,18,.1)', color: i.pinned ? '#f5c518' : 'rgba(42,27,18,.5)' }}
              >
                <Star size={14} fill={i.pinned ? '#f5c518' : 'none'} />
              </button>
            </div>
            <p className="mt-2.5 mb-3 font-serif text-[20px] leading-[1.22] text-ink">{i.text}</p>
            <div className="flex items-center justify-between gap-2 text-[11px] text-ink-muted">
              <span>{ago(i.createdAt)}</span>
              <button type="button" onClick={() => promote(i.text)} className="font-semibold text-accent hover:underline">virar episódio →</button>
            </div>
          </div>
        ))}
      </div>
      {!shown.length && <p className="text-[14px] text-ink-soft">Nenhuma ideia aqui ainda.</p>}
    </div>
  )
}
