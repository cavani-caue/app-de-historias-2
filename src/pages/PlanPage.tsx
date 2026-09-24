import { Minus, Plus, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { BoardView } from '../boards/BoardView'
import { BackLink, InlineEdit, Pill, PrimaryButton } from '../components/ui'
import { ARC_COLORS, BOARDS, FORMATS, FUNCS, PHASES, phaseOf, STATUSES, statusOf } from '../data/constants'
import { usePlan } from '../hooks/usePlan'
import { epNum, plural } from '../lib/format'
import { serieEpisodes } from '../lib/selectors'
import { useEpisode, useSerie, useStore } from '../store'
import type { BoardId, Episode, Plan } from '../types'
import NotFound from './NotFound'

const card = 'rounded-[24px] bg-paper p-5 shadow-card'
const area = 'w-full resize-y border-0 bg-transparent outline-none placeholder:text-ink/35'

function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`label-caps ${className}`}>{children}</div>
}

export default function PlanPage() {
  const { serieId = '', epId } = useParams()
  const serie = useSerie(serieId)
  const ep = useEpisode(epId)
  const isEp = !!epId
  const key = isEp ? 'ep:' + epId : serieId
  const [plan, setPlan] = usePlan(key)
  const [params, setParams] = useSearchParams()
  const [addOpen, setAddOpen] = useState(false)

  if (!serie || (isEp && (!ep || ep.serieId !== serieId))) return <NotFound />

  const boards = plan.boards
  const tab = (params.get('quadro') as BoardId | null) ?? boards[0]
  const pickTab = (id: BoardId) => setParams((p) => { p.set('quadro', id); p.delete('tela'); return p }, { replace: true })
  const missing = BOARDS.filter((b) => !boards.includes(b.id))
  const removeBoard = (id: BoardId) => {
    const label = BOARDS.find((b) => b.id === id)?.label
    if (!confirm(`Tirar "${label}" deste planejamento? As anotações ficam guardadas se você adicionar de novo.`)) return
    const next = boards.filter((b) => b !== id)
    setPlan({ boards: next })
    if (tab === id && next[0]) pickTab(next[0])
  }

  return (
    <div className="max-w-[1080px]">
      <BackLink to={isEp ? `/h/${serieId}/ep/${epId}` : `/h/${serieId}`} label={isEp && ep ? `ep. ${epNum(ep.num)} — ${ep.title}` : serie.title} />
      <header className="mb-[22px]">
        <h1 className="m-0 font-serif text-[52px] leading-none font-normal text-ink">{isEp ? 'Planejamento do episódio' : 'Planejamento da história'}</h1>
        <p className="mt-2 mb-0 text-[14px] text-ink-soft">
          {isEp && ep ? `ep. ${epNum(ep.num)} — ${ep.title} · o desenho do episódio antes do texto.` : 'O desenho da série antes dos textos: do que ela trata, em quantos episódios e o que já é canônico.'}
        </p>
      </header>

      <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        <div className={card}>
          <Label className="mb-2">Premissa</Label>
          <textarea value={plan.premissa} onChange={(e) => setPlan({ premissa: e.target.value })} rows={3} placeholder="Do que é a história, numa frase com conflito." className={`${area} font-serif text-[21px] leading-[1.3] text-ink`} />
          <Label className="mt-4 mb-2">Pergunta dramática</Label>
          <textarea value={plan.pergunta} onChange={(e) => setPlan({ pergunta: e.target.value })} rows={2} placeholder="A pergunta que o final responde." className={`${area} font-serif text-[19px] leading-[1.3] text-ink/80 italic`} />
          <Label className="mt-4 mb-2">Princípio narrativo</Label>
          <textarea value={plan.principio} onChange={(e) => setPlan({ principio: e.target.value })} rows={2} placeholder={isEp ? 'A ideia de forma: o que a estrutura do episódio faz com o espectador.' : 'A ideia de forma: o que a estrutura da série faz com o espectador.'} className={`${area} text-[13.5px] leading-[1.45] text-ink/78`} />
        </div>
        {!isEp && <SerieCards serieId={serieId} plan={plan} setPlan={setPlan} />}
      </div>

      <h2 className="mt-0 mb-3 font-serif text-[34px] font-normal text-ink">Estrutura</h2>
      <div className="mb-[14px] flex flex-wrap items-center gap-2" role="tablist">
        {boards.map((id) => {
          const active = tab === id
          return (
            <span key={id} className="inline-flex items-center rounded-full border-[1.5px]" style={active ? { background: '#2a1b12', color: '#f7ecdc', borderColor: '#2a1b12' } : { background: 'rgba(247,236,220,.6)', color: '#3a2318', borderColor: 'rgba(58,35,24,.2)' }}>
              <button type="button" role="tab" aria-selected={active} onClick={() => pickTab(id)} className={`py-[9px] pl-4 text-[12.5px] font-semibold whitespace-nowrap ${active ? 'pr-1.5' : 'pr-4'}`}>
                {BOARDS.find((b) => b.id === id)?.label}
              </button>
              {active && (
                <button type="button" onClick={() => removeBoard(id)} title="Tirar este quadro" aria-label="Tirar este quadro" className="mr-1.5 flex size-6 items-center justify-center rounded-full opacity-60 hover:bg-paper/20 hover:opacity-100">
                  <X size={13} />
                </button>
              )}
            </span>
          )
        })}
        {missing.length > 0 && (
          <button type="button" onClick={() => setAddOpen((o) => !o)} aria-expanded={addOpen} className="rounded-full border-[1.5px] border-dashed border-paper/80 px-4 py-[9px] text-[12.5px] font-semibold whitespace-nowrap text-paper/95 hover:bg-paper/12">
            + adicionar quadro
          </button>
        )}
      </div>

      {addOpen && missing.length > 0 && (
        <div className="mb-[18px] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2.5">
          {missing.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => { setPlan({ boards: [...boards, b.id] }); pickTab(b.id); setAddOpen(false) }}
              className="rounded-[18px] bg-paper-2 px-4 py-[14px] text-left shadow-[0_14px_30px_-24px_rgba(35,18,9,.7)] hover:bg-paper"
            >
              <span className="block text-[13.5px] font-bold text-ink">{b.label}</span>
              <span className="mt-1 block text-[12px] text-ink/60">{b.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mb-[30px] rounded-[24px] bg-paper p-[22px] shadow-card">
        {tab && boards.includes(tab) ? <BoardView key={key + tab} id={tab} planKey={key} serieId={serieId} epId={epId} /> : <p className="m-0 text-[13px] text-ink-soft">Nenhum quadro. Use "+ adicionar quadro".</p>}
      </div>

      {!isEp && <EpisodeGrid serieId={serieId} />}
    </div>
  )
}

function SerieCards({ serieId, plan, setPlan }: { serieId: string; plan: Plan; setPlan: (p: Partial<Plan>) => void }) {
  const eps = useStore(useShallow((s) => serieEpisodes(s, serieId)))
  const arcs = useStore(useShallow((s) => s.arcs.filter((a) => a.serieId === serieId)))
  const { addArc, updateArc } = useStore.getState()
  const previstos = plan.previstos ?? eps.length
  const placed = eps.filter((e) => e.status !== 'cut').length
  const gap = previstos - placed

  return (
    <>
      <div className={card}>
        <Label className="mb-2.5">Formato</Label>
        <div className="flex flex-wrap gap-[7px]">
          {FORMATS.map((f) => {
            const on = plan.formato === f
            return (
              <button key={f} type="button" aria-pressed={on} onClick={() => setPlan({ formato: f })} className="rounded-full border-[1.5px] px-[13px] py-[7px] text-[12px] font-semibold" style={on ? { background: '#2a1b12', color: '#f7ecdc', borderColor: '#2a1b12' } : { color: '#3a2318', borderColor: 'rgba(58,35,24,.22)' }}>
                {f}
              </button>
            )
          })}
        </div>
        <Label className="mt-[18px] mb-2.5">Episódios previstos</Label>
        <div className="flex items-center gap-[14px]">
          <button type="button" aria-label="Menos um" onClick={() => setPlan({ previstos: Math.max(1, previstos - 1) })} className="flex size-[34px] items-center justify-center rounded-[12px] bg-rail/10 text-ink hover:bg-rail/18"><Minus size={17} /></button>
          <span className="font-display text-[34px] text-ink">{previstos}</span>
          <button type="button" aria-label="Mais um" onClick={() => setPlan({ previstos: previstos + 1 })} className="flex size-[34px] items-center justify-center rounded-[12px] bg-rail/10 text-ink hover:bg-rail/18"><Plus size={17} /></button>
          <span className="min-w-0 text-[12px] text-ink/60">
            {gap > 0 ? `${plural(gap, 'episódio previsto', 'episódios previstos')} ainda sem lugar na grade` : gap < 0 ? `${plural(-gap, 'episódio', 'episódios')} além do previsto` : 'grade completa'}
          </span>
        </div>
        <div className="mt-[18px] flex flex-wrap gap-[7px]">
          {STATUSES.map((s) => (
            <span key={s.id} className="rounded-full px-[11px] py-1.5 font-mono text-[11px] font-bold" style={{ background: s.bg, color: s.fg }}>
              {eps.filter((e) => e.status === s.id).length} {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="mb-3 flex items-center">
          <Label>Arcos</Label>
          <button type="button" onClick={() => addArc(serieId, { color: ARC_COLORS[arcs.length % ARC_COLORS.length] })} className="ml-auto text-[11.5px] font-semibold text-accent hover:underline">+ arco</button>
        </div>
        <div className="flex flex-col gap-3">
          {arcs.map((a, i) => {
            const mine = eps.filter((e) => e.arcId === a.id)
            return (
              <div key={a.id}>
                <div className="flex items-center gap-2 text-[13px] text-ink">
                  <button
                    type="button"
                    title="Trocar cor"
                    aria-label="Trocar cor do arco"
                    onClick={() => updateArc(a.id, { color: ARC_COLORS[(ARC_COLORS.indexOf(a.color) + 1) % ARC_COLORS.length] })}
                    className="size-[9px] shrink-0 rounded-full"
                    style={{ background: a.color }}
                  />
                  <InlineEdit value={a.title} onSave={(title) => updateArc(a.id, { title })} className="truncate" placeholder={`Arco ${i + 1}`} />
                  <span className="ml-auto font-mono text-[11px] text-ink-muted">{mine.length}</span>
                </div>
                <div className="mt-1.5 flex h-2 gap-1">
                  {mine.map((e) => <span key={e.id} title={`ep. ${epNum(e.num)} — ${e.title}`} className="h-2 flex-1 rounded-full" style={{ background: statusOf(e.status).bg }} />)}
                  {!mine.length && <span className="h-2 flex-1 rounded-full border border-dashed border-line-strong" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function EpisodeGrid({ serieId }: { serieId: string }) {
  const navigate = useNavigate()
  const eps = useStore(useShallow((s) => serieEpisodes(s, serieId)))
  const addEpisode = useStore((s) => s.addEpisode)
  const addPlanned = () => addEpisode(serieId, { title: 'Episódio previsto', logline: 'Só o lugar na grade por enquanto.', status: 'idea' })

  return (
    <section>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-5">
        <h2 className="m-0 font-serif text-[34px] font-normal text-ink">Grade de episódios</h2>
        <PrimaryButton small onClick={addPlanned}>Episódio previsto</PrimaryButton>
      </div>
      <div className="mb-[14px] flex flex-wrap gap-2">
        {STATUSES.map((l) => (
          <span key={l.id} title={l.desc} className="inline-flex items-center gap-[7px] text-[11.5px] text-ink/70">
            <span className="size-[9px] rounded-full" style={{ background: l.bg }} />
            {l.label}
          </span>
        ))}
        <span className="ml-1.5 text-[11.5px] text-ink/50">clique nas etiquetas da grade pra trocar</span>
      </div>
      <div className="flex flex-col gap-2">
        {eps.map((e) => <GridRow key={e.id} ep={e} onOpen={() => navigate(`/h/${serieId}/ep/${e.id}`)} />)}
        <button type="button" onClick={addPlanned} className="rounded-[18px] border-2 border-dashed border-paper/75 p-[14px] text-center text-[12.5px] font-semibold text-paper/90 hover:bg-paper/12">
          + episódio previsto
        </button>
      </div>
    </section>
  )
}

function GridRow({ ep, onOpen }: { ep: Episode; onOpen: () => void }) {
  const arcs = useStore(useShallow((s) => s.arcs.filter((a) => a.serieId === ep.serieId)))
  const docCount = useStore((s) => s.docs.filter((d) => d.episodeId === ep.id).length)
  const updateEpisode = useStore((s) => s.updateEpisode)
  const arc = arcs.find((a) => a.id === ep.arcId)
  const arcColor = arc?.color ?? 'rgba(42,27,18,.5)'
  const st = statusOf(ep.status)
  const ph = phaseOf(ep.phase)
  const next = <T,>(list: T[], cur: T) => list[(list.indexOf(cur) + 1) % list.length]

  return (
    <div className={`flex flex-wrap items-center gap-[14px] rounded-[18px] bg-paper px-4 py-[14px] shadow-[0_14px_30px_-24px_rgba(35,18,9,.7)] ${ep.status === 'cut' ? 'opacity-45' : ''}`}>
      <span className="shrink-0 font-display text-[17px]" style={{ color: arcColor }}>{epNum(ep.num)}</span>
      <button type="button" onClick={onOpen} className="min-w-[160px] flex-1 text-left">
        <span className="block font-serif text-[21px] leading-[1.15] text-ink">{ep.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-ink/60">{ep.logline || 'Sem logline ainda.'}</span>
      </button>
      <button type="button" title="Função na série — clique pra trocar" onClick={() => updateEpisode(ep.id, { func: next(FUNCS, ep.func) })} className="rounded-full border-[1.5px] border-line-strong px-[11px] py-1.5 font-mono text-[11px] font-bold tracking-[.06em] whitespace-nowrap text-rail uppercase hover:border-accent hover:text-accent">
        {ep.func}
      </button>
      <button
        type="button"
        title="Arco — clique pra trocar"
        onClick={() => arcs.length && updateEpisode(ep.id, { arcId: arcs[(arcs.findIndex((a) => a.id === ep.arcId) + 1) % arcs.length].id })}
        className="max-w-[200px] truncate rounded-full bg-rail/8 px-[11px] py-1.5 text-[11.5px] font-semibold whitespace-nowrap"
        style={{ color: arcColor }}
      >
        {arc?.title ?? 'sem arco'}
      </button>
      <Pill bg={ph.color} fg={ph.ink} title="Fase — clique pra trocar" onClick={() => updateEpisode(ep.id, { phase: next(PHASES.map((p) => p.id), ep.phase) })} className="px-[11px] py-1.5">
        {ph.title}
      </Pill>
      <Pill bg={st.bg} fg={st.fg} title="Canônico, temporário, ideia ou descartado — clique pra trocar" onClick={() => updateEpisode(ep.id, { status: next(STATUSES.map((s) => s.id), ep.status) })} className="px-3 py-1.5">
        {st.label}
      </Pill>
      <span className="font-mono text-[11px] whitespace-nowrap text-ink/50">{plural(docCount, 'texto', 'textos')}</span>
    </div>
  )
}
