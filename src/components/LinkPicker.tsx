import { Link2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { linkOptions, type LinkOption } from '../lib/links'
import { useStore } from '../store'
import type { Episode, Serie } from '../types'

const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Modal "Inserir ligação" com busca (setas + Enter escolhem). */
export function LinkPicker({ serie, ep, onPick, onClose }: { serie: Serie; ep?: Episode; onPick: (o: LinkOption) => void; onClose: () => void }) {
  const state = useStore()
  const all = useMemo(() => linkOptions(state, serie, ep), [state, serie, ep])
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const shown = all.filter((o) => !q || norm(o.label + ' ' + o.group + ' ' + o.search).includes(norm(q)))

  useEffect(() => { list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(shown.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && shown[active]) { e.preventDefault(); onPick(shown[active]) }
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center bg-[rgba(30,15,8,.35)] pt-[12vh]" onMouseDown={onClose}>
      <div role="dialog" aria-label="Inserir ligação" className="flex max-h-[70vh] w-[min(520px,92vw)] flex-col overflow-hidden rounded-[22px] bg-paper-2 shadow-[0_30px_60px_-20px_rgba(30,15,8,.7)]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="px-[18px] pt-4 pb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[.12em] text-link uppercase"><Link2 size={13} /> Inserir ligação</div>
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0) }}
            onKeyDown={onKey}
            placeholder="buscar post-it, etapa, episódio, ideia…"
            aria-label="Buscar alvo da ligação"
            className="mt-2 w-full rounded-[12px] border-[1.5px] border-rail/20 bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-link"
          />
        </div>
        <div ref={list} className="flex flex-col gap-0.5 overflow-y-auto px-2.5 pb-3" role="listbox">
          {shown.map((o, i) => (
            <button
              key={o.group + o.label + i}
              data-i={i}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(o)}
              className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-[9px] text-left ${i === active ? 'bg-link/8' : ''}`}
            >
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: o.color }} />
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{o.label}</span>
              <span className="text-[10.5px] whitespace-nowrap text-ink/50">{o.group}</span>
            </button>
          ))}
          {!shown.length && <div className="px-3 py-4 text-[13px] text-ink-muted">Nada encontrado.</div>}
        </div>
      </div>
    </div>
  )
}
