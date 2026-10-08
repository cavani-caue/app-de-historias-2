import { Link2, Lock, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { phaseOf } from '../data/constants'
import { useClickOutside } from '../hooks/useClickOutside'
import { useNow } from '../hooks/useNow'
import { docMeta, docPlace, isLocked, linkOptions } from '../lib/selectors'
import { useStore } from '../store'
import type { Doc } from '../types'
import { Pill } from './ui'

export function DocCard({ doc, showPlace }: { doc: Doc; showPlace?: boolean }) {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const [linkOpen, setLinkOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useClickOutside(box, () => setLinkOpen(false), linkOpen)
  const place = useStore((s) => (showPlace ? docPlace(s, doc) : ''))
  const deleteDoc = useStore((s) => s.deleteDoc)
  const phase = phaseOf(doc.phase)
  const open = () => navigate('/texto/' + doc.id)
  const locked = isLocked(doc, now)

  return (
    <div ref={box} className={`relative rounded-[24px] bg-paper p-[18px] shadow-card ${linkOpen ? 'z-50' : ''}`}>
      <button type="button" onClick={open} className="block w-full text-left">
        <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[.1em] text-ink/50 uppercase">
          <span className="size-[7px] rounded-full" style={{ background: phase.color }} />
          {doc.format}
          {locked && <Lock size={11} className="ml-auto" />}
        </span>
        <span className="mt-2 mb-1.5 block font-serif text-[26px] leading-[1.1] text-ink">{doc.title}</span>
        <span className="block text-[12px] text-ink/60">{docMeta(doc, now)}</span>
      </button>
      {showPlace && (
        <div className="mt-3 flex">
          <Pill bg={phase.color} fg={phase.ink} className="max-w-full overflow-hidden text-ellipsis">{place}</Pill>
        </div>
      )}
      <div className="mt-[14px] flex items-center gap-2">
        <button type="button" onClick={open} className="rounded-full bg-ink px-[14px] py-[7px] text-[12px] font-semibold text-paper hover:bg-black">Abrir</button>
        <button
          type="button"
          title="Apagar texto"
          aria-label="Apagar texto"
          onClick={() => { if (confirm(`Apagar "${doc.title}"? Não dá pra desfazer.`)) deleteDoc(doc.id) }}
          className="ml-auto flex size-[30px] items-center justify-center rounded-full text-ink/45 hover:bg-ink/8 hover:text-accent"
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => setLinkOpen((o) => !o)}
          aria-expanded={linkOpen}
          className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line-strong px-[13px] py-1.5 text-[12px] font-semibold text-rail hover:border-accent hover:text-accent"
        >
          <Link2 size={13} strokeWidth={2.2} />
          Ligar
        </button>
      </div>
      {linkOpen && <LinkPopover doc={doc} onDone={() => setLinkOpen(false)} />}
    </div>
  )
}

function LinkPopover({ doc, onDone }: { doc: Doc; onDone: () => void }) {
  const state = useStore()
  const options = useMemo(() => linkOptions(state), [state])
  const updateDoc = state.updateDoc
  const [q, setQ] = useState('')
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="absolute top-[calc(100%-8px)] right-[14px] left-[14px] z-50 rounded-[20px] bg-paper-2 p-[14px] shadow-pop">
      <div className="mb-2.5 label-caps">Ligar a um episódio e fase</div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar…"
        className="mb-2 w-full rounded-[11px] border border-line-strong bg-transparent px-3 py-2 text-[13px] outline-none focus:border-accent"
      />
      <div className="flex max-h-[280px] flex-col gap-1.5 overflow-y-auto">
        {shown.map((o) => {
          const current = o.episodeId === doc.episodeId && o.phase === doc.phase
          return (
            <button
              key={o.episodeId + o.phase}
              type="button"
              onClick={() => { updateDoc(doc.id, { episodeId: o.episodeId, phase: o.phase }); onDone() }}
              className={`flex items-center gap-[9px] rounded-[13px] px-[11px] py-[9px] text-left text-[13px] text-ink hover:bg-ink/8 ${current ? 'bg-ink/12' : ''}`}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />
              <span className="truncate">{o.label}</span>
            </button>
          )
        })}
        {!shown.length && <div className="px-2 py-3 text-[12.5px] text-ink-muted">Nada encontrado.</div>}
      </div>
    </div>
  )
}
