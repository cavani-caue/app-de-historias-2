import { Maximize2, Minimize2, Minus, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from 'react'
import { NOTE_COLORS, PEN_COLORS } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { uid } from '../lib/id'
import type { Wall as WallData, WallGroup, WallNote } from '../types'

type Mode = 'mover' | 'caneta' | 'postit' | 'grupo'
type Pt = [number, number]
type Drag =
  | { kind: 'pan'; x: number; y: number; vx: number; vy: number }
  | { kind: 'note'; id: string; dx: number; dy: number }
  | { kind: 'rnote'; id: string }
  | { kind: 'group'; id: string; px: number; py: number; gx: number; gy: number; inside: Record<string, Pt> }
  | { kind: 'rgroup'; id: string }
  | { kind: 'pen'; pts: Pt[]; color: string }
  | { kind: 'frame'; x0: number; y0: number; x1: number; y1: number }

const MIN_S = 0.35
const MAX_S = 2.4
const TOOLS: [Mode, string][] = [['mover', 'Mover'], ['caneta', 'Caneta'], ['postit', 'Post-it'], ['grupo', 'Grupo']]
const path = (pts: Pt[]) => pts.map((p, i) => (i ? 'L' : 'M') + Math.round(p[0]) + ' ' + Math.round(p[1])).join(' ')
const center = (n: WallNote): Pt => [n.x + n.w / 2, n.y + n.h / 2]
const inGroup = (g: WallGroup, n: WallNote) => { const [cx, cy] = center(n); return cx > g.x && cx < g.x + g.w && cy > g.y && cy < g.y + g.h }

export interface WallProps {
  planKey: string
  full: boolean
  onToggleFull: () => void
  /** Post-it para centralizar e destacar ao abrir (vindo de uma ligação). */
  focusNote?: string | null
}

export default function Wall({ planKey, full, onToggleFull, focusNote }: WallProps) {
  const [plan, setPlan] = usePlan(planKey)
  const [w, setW] = useState<WallData>(plan.wall)
  const [mode, setMode] = useState<Mode>('mover')
  const [pen, setPen] = useState(PEN_COLORS[1])
  const [color, setColor] = useState(NOTE_COLORS[0])
  const [live, setLive] = useState<Drag | null>(null) // traço/moldura em andamento
  const [flash, setFlash] = useState<string | null>(null)
  const view = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const wRef = useRef(w)
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Atualiza a parede na tela e grava no plano (agrupado). */
  const commit = useCallback((fn: (w: WallData) => WallData) => {
    const next = fn(wRef.current)
    wRef.current = next
    setW(next)
    if (saveT.current) clearTimeout(saveT.current)
    saveT.current = setTimeout(() => { saveT.current = null; setPlan({ wall: wRef.current }) }, 200)
  }, [setPlan])

  // Grava o que faltar ao desmontar.
  useEffect(() => () => { if (saveT.current) { clearTimeout(saveT.current); setPlan({ wall: wRef.current }) } }, [setPlan])

  const world = (e: { clientX: number; clientY: number }): Pt => {
    const r = view.current!.getBoundingClientRect()
    const cur = wRef.current
    return [(e.clientX - r.left - cur.vx) / cur.scale, (e.clientY - r.top - cur.vy) / cur.scale]
  }

  // Roda: zoom no cursor (listener não-passivo para impedir a rolagem da página).
  useEffect(() => {
    const el = view.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.shiftKey) { commit((c) => ({ ...c, vx: c.vx - (e.deltaY || e.deltaX) })); return }
      const r = el.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      commit((c) => {
        const s = Math.min(MAX_S, Math.max(MIN_S, c.scale * Math.exp(-e.deltaY * 0.0015)))
        const wx = (mx - c.vx) / c.scale, wy = (my - c.vy) / c.scale
        return { ...c, scale: s, vx: mx - wx * s, vy: my - wy * s }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [commit, full])

  // Centraliza e destaca um post-it pedido de fora.
  useEffect(() => {
    if (!focusNote) return
    const n = wRef.current.notes.find((x) => x.id === focusNote)
    const el = view.current
    if (!n || !el) return
    const r = el.getBoundingClientRect()
    commit((c) => ({ ...c, vx: r.width / 2 - (n.x + n.w / 2) * c.scale, vy: r.height / 2 - (n.y + n.h / 2) * c.scale }))
    setFlash(focusNote)
    const t = setTimeout(() => setFlash(null), 2400)
    return () => clearTimeout(t)
  }, [focusNote, commit, full])

  const zoomBy = (k: number) => {
    const el = view.current
    if (!el) return
    const r = el.getBoundingClientRect()
    commit((c) => {
      const s = Math.min(MAX_S, Math.max(MIN_S, c.scale * k))
      const wx = (r.width / 2 - c.vx) / c.scale, wy = (r.height / 2 - c.vy) / c.scale
      return { ...c, scale: s, vx: r.width / 2 - wx * s, vy: r.height / 2 - wy * s }
    })
  }

  const capture = (e: RPointerEvent) => view.current?.setPointerCapture?.(e.pointerId)

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const p = world(e)
    if (mode === 'caneta') drag.current = { kind: 'pen', pts: [p], color: pen }
    else if (mode === 'postit') {
      const id = uid('n')
      commit((c) => ({ ...c, notes: [...c.notes, { id, x: p[0] - 90, y: p[1] - 70, w: 180, h: 150, color, text: '' }] }))
      setMode('mover')
      setTimeout(() => document.querySelector<HTMLTextAreaElement>(`[data-note="${id}"] textarea`)?.focus(), 30)
      return
    } else if (mode === 'grupo') drag.current = { kind: 'frame', x0: p[0], y0: p[1], x1: p[0], y1: p[1] }
    else drag.current = { kind: 'pan', x: e.clientX, y: e.clientY, vx: wRef.current.vx, vy: wRef.current.vy }
    setLive(drag.current)
    capture(e)
  }

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (d.kind === 'pan') { commit((c) => ({ ...c, vx: d.vx + (e.clientX - d.x), vy: d.vy + (e.clientY - d.y) })); return }
    const p = world(e)
    if (d.kind === 'pen') { d.pts.push(p); setLive({ ...d }) }
    else if (d.kind === 'frame') { d.x1 = p[0]; d.y1 = p[1]; setLive({ ...d }) }
    else if (d.kind === 'note') commit((c) => ({ ...c, notes: c.notes.map((n) => (n.id === d.id ? { ...n, x: p[0] - d.dx, y: p[1] - d.dy } : n)) }))
    else if (d.kind === 'rnote') commit((c) => ({ ...c, notes: c.notes.map((n) => (n.id === d.id ? { ...n, w: Math.max(120, p[0] - n.x), h: Math.max(90, p[1] - n.y) } : n)) }))
    else if (d.kind === 'group') {
      const dx = p[0] - d.px, dy = p[1] - d.py
      commit((c) => ({
        ...c,
        groups: c.groups.map((g) => (g.id === d.id ? { ...g, x: d.gx + dx, y: d.gy + dy } : g)),
        notes: c.notes.map((n) => (d.inside[n.id] ? { ...n, x: d.inside[n.id][0] + dx, y: d.inside[n.id][1] + dy } : n)),
      }))
    } else if (d.kind === 'rgroup') commit((c) => ({ ...c, groups: c.groups.map((g) => (g.id === d.id ? { ...g, w: Math.max(160, p[0] - g.x), h: Math.max(120, p[1] - g.y) } : g)) }))
  }

  const onUp = () => {
    const d = drag.current
    if (d?.kind === 'pen' && d.pts.length > 1) commit((c) => ({ ...c, strokes: [...c.strokes, { d: path(d.pts), color: d.color }] }))
    if (d?.kind === 'frame') {
      const gw = Math.abs(d.x1 - d.x0), gh = Math.abs(d.y1 - d.y0)
      if (gw > 40 && gh > 40) {
        commit((c) => ({ ...c, groups: [...c.groups, { id: uid('g'), x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w: gw, h: gh, title: 'Grupo', color: pen }] }))
        setMode('mover')
      }
    }
    drag.current = null
    setLive(null)
  }

  const onDouble = (e: RMouseEvent) => {
    if (mode !== 'mover' || e.target !== view.current) return
    const p = world(e)
    const id = uid('n')
    commit((c) => ({ ...c, notes: [...c.notes, { id, x: p[0] - 90, y: p[1] - 70, w: 180, h: 150, color, text: '' }] }))
    setTimeout(() => document.querySelector<HTMLTextAreaElement>(`[data-note="${id}"] textarea`)?.focus(), 30)
  }

  const grabNote = (n: WallNote) => (e: RPointerEvent) => {
    e.stopPropagation()
    const p = world(e)
    drag.current = { kind: 'note', id: n.id, dx: p[0] - n.x, dy: p[1] - n.y }
    capture(e)
  }
  const grabGroup = (g: WallGroup) => (e: RPointerEvent) => {
    e.stopPropagation()
    const p = world(e)
    const inside: Record<string, Pt> = {}
    wRef.current.notes.filter((n) => inGroup(g, n)).forEach((n) => { inside[n.id] = [n.x, n.y] })
    drag.current = { kind: 'group', id: g.id, px: p[0], py: p[1], gx: g.x, gy: g.y, inside }
    capture(e)
  }
  const stop = (e: RPointerEvent) => e.stopPropagation()
  const pe = mode === 'mover' ? 'auto' : 'none'

  const frame = live?.kind === 'frame' ? live : null
  const stroke = live?.kind === 'pen' ? live : null

  const toolbar = (
    <div className="mb-2.5 flex flex-wrap items-center gap-2">
      <div className="flex gap-[3px] rounded-full bg-paper-2 p-1" role="toolbar" aria-label="Ferramentas da parede">
        {TOOLS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className="rounded-full px-[14px] py-[7px] text-[12px] font-semibold" style={mode === id ? { background: '#2a1b12', color: '#f7ecdc' } : { color: '#3a2318' }}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-[7px] rounded-full bg-paper-2 px-3 py-[7px]">
        <span className="text-[11px] text-ink-muted">post-it</span>
        {NOTE_COLORS.map((c) => (
          <button key={c} type="button" aria-label={`Post-it ${c}`} onClick={() => { setColor(c); setMode('postit') }} className="size-[18px] rounded-[4px]" style={{ background: c, boxShadow: color === c ? '0 0 0 2px #fffdf7, 0 0 0 4px #2a1b12' : 'none' }} />
        ))}
      </div>
      <div className="flex items-center gap-[7px] rounded-full bg-paper-2 px-3 py-[7px]">
        <span className="text-[11px] text-ink-muted">caneta</span>
        {PEN_COLORS.map((c) => (
          <button key={c} type="button" aria-label={`Caneta ${c}`} onClick={() => { setPen(c); setMode('caneta') }} className="size-4 rounded-full" style={{ background: c, boxShadow: pen === c && mode === 'caneta' ? '0 0 0 2px #fffdf7, 0 0 0 4px #2a1b12' : 'none' }} />
        ))}
        <button type="button" onClick={() => { if (!w.strokes.length || confirm('Apagar todos os traços?')) commit((c) => ({ ...c, strokes: [] })) }} className="ml-1 text-[11px] font-semibold text-accent hover:underline">apagar traços</button>
      </div>
      <div className="ml-auto flex items-center gap-1 rounded-full bg-paper-2 px-1.5 py-1">
        <button type="button" aria-label="Menos zoom" onClick={() => zoomBy(1 / 1.15)} className="flex size-7 items-center justify-center rounded-full hover:bg-rail/10"><Minus size={14} /></button>
        <button type="button" title="Voltar a 100%" onClick={() => commit((c) => ({ ...c, vx: 40, vy: 40, scale: 1 }))} className="min-w-11 text-center font-mono text-[11px]">{Math.round(w.scale * 100)}%</button>
        <button type="button" aria-label="Mais zoom" onClick={() => zoomBy(1.15)} className="flex size-7 items-center justify-center rounded-full hover:bg-rail/10"><Plus size={14} /></button>
      </div>
      <button type="button" onClick={onToggleFull} title="Tela cheia (Esc para sair)" className="inline-flex items-center gap-[7px] rounded-full bg-ink px-[15px] py-[9px] text-[12px] font-semibold whitespace-nowrap text-paper hover:bg-black">
        {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        {full ? 'Sair da tela cheia' : 'Tela cheia'}
      </button>
    </div>
  )

  return (
    <div className={full ? 'fixed inset-0 z-[300] flex h-screen flex-col bg-desk p-[14px]' : 'flex flex-col'}>
      {toolbar}
      <div
        ref={view}
        data-wall
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={onDouble}
        className={`relative touch-none overflow-hidden rounded-[20px] bg-wall shadow-[inset_0_0_0_1px_rgba(58,35,24,.14)] select-none ${full ? 'min-h-0 flex-1' : 'h-[620px]'}`}
        style={{
          backgroundImage: 'radial-gradient(rgba(58,35,24,.22) 1.2px, transparent 1.2px)',
          backgroundSize: `${26 * w.scale}px ${26 * w.scale}px`,
          backgroundPosition: `${w.vx}px ${w.vy}px`,
          cursor: mode === 'caneta' ? 'crosshair' : mode === 'postit' ? 'copy' : mode === 'grupo' ? 'crosshair' : live?.kind === 'pan' ? 'grabbing' : 'grab',
        }}
      >
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${w.vx}px,${w.vy}px) scale(${w.scale})` }}>
          {w.groups.map((g) => {
            const count = w.notes.filter((n) => inGroup(g, n)).length
            return (
              <div key={g.id} className="pointer-events-none absolute rounded-[18px] border-2 border-dashed" style={{ left: g.x, top: g.y, width: g.w, height: g.h, borderColor: g.color, background: g.color + '12' }}>
                <div onPointerDown={grabGroup(g)} className="absolute -top-[15px] left-3 flex cursor-move items-center gap-1.5 rounded-full py-1 pr-1.5 pl-3 text-white" style={{ background: g.color, pointerEvents: pe }}>
                  <input
                    value={g.title}
                    onChange={(e) => commit((c) => ({ ...c, groups: c.groups.map((x) => (x.id === g.id ? { ...x, title: e.target.value } : x)) }))}
                    onPointerDown={stop}
                    aria-label="Título do grupo"
                    className="border-0 bg-transparent text-[12px] font-bold text-white outline-none"
                    style={{ width: Math.max(50, g.title.length * 7.5) }}
                  />
                  <span className="font-mono text-[10px] opacity-85">{count}</span>
                  <button type="button" aria-label="Apagar grupo" onPointerDown={stop} onClick={() => commit((c) => ({ ...c, groups: c.groups.filter((x) => x.id !== g.id) }))} className="px-1"><X size={12} /></button>
                </div>
                <div onPointerDown={(e) => { stop(e); drag.current = { kind: 'rgroup', id: g.id }; capture(e) }} title="redimensionar grupo" className="absolute -right-[7px] -bottom-[7px] size-4 cursor-nwse-resize rounded-[4px]" style={{ background: g.color, pointerEvents: pe }} />
              </div>
            )
          })}
          {frame && (
            <div className="absolute rounded-[18px] border-2 border-dashed border-ink bg-ink/5" style={{ left: Math.min(frame.x0, frame.x1), top: Math.min(frame.y0, frame.y1), width: Math.abs(frame.x1 - frame.x0), height: Math.abs(frame.y1 - frame.y0) }} />
          )}
          {w.notes.map((n) => (
            <div
              key={n.id}
              data-note={n.id}
              className="absolute flex flex-col transition-shadow"
              style={{ left: n.x, top: n.y, width: n.w, height: n.h, background: n.color, pointerEvents: pe, boxShadow: flash === n.id ? '0 0 0 5px #2c5bd1, 0 18px 30px -12px rgba(35,18,9,.7)' : '0 12px 22px -12px rgba(35,18,9,.7)' }}
            >
              <div onPointerDown={grabNote(n)} className="flex h-[22px] shrink-0 cursor-move items-center justify-end bg-black/5 px-1.5">
                <button type="button" aria-label="Apagar post-it" onPointerDown={stop} onClick={() => commit((c) => ({ ...c, notes: c.notes.filter((x) => x.id !== n.id) }))} className="text-ink/50 hover:text-ink"><X size={13} /></button>
              </div>
              <textarea
                value={n.text}
                onChange={(e) => commit((c) => ({ ...c, notes: c.notes.map((x) => (x.id === n.id ? { ...x, text: e.target.value } : x)) }))}
                onPointerDown={stop}
                placeholder="escreva…"
                aria-label="Texto do post-it"
                className="min-h-0 flex-1 resize-none border-0 bg-transparent px-3 pt-2 pb-[14px] font-serif text-[18px] leading-[1.25] text-ink outline-none placeholder:text-ink/35"
              />
              <div onPointerDown={(e) => { stop(e); drag.current = { kind: 'rnote', id: n.id }; capture(e) }} title="redimensionar" className="absolute right-0 bottom-0 size-[18px] cursor-nwse-resize" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(42,27,18,.3) 50%)' }} />
            </div>
          ))}
          <svg width="1" height="1" className="pointer-events-none absolute top-0 left-0 overflow-visible">
            {w.strokes.map((s, i) => <path key={i} d={s.d} stroke={s.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
            {stroke && <path d={path(stroke.pts)} stroke={stroke.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-[14px] font-mono text-[10.5px] text-ink/50">
          fundo = navegar · roda = zoom · duplo clique = post-it · faixa do post-it = mover · canto = redimensionar · Caneta desenha por cima de tudo · Grupo: arraste pra criar uma moldura
        </div>
      </div>
    </div>
  )
}
