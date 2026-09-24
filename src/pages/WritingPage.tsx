import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import { ArrowLeft, Clock3, Download, Link2, PanelLeft, Redo2, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { InlineEdit } from '../components/ui'
import { JOURNEY, phaseOf } from '../data/constants'
import { editorExtensions } from '../editor/extensions'
import { useClickOutside } from '../hooks/useClickOutside'
import { exportDoc } from '../lib/export'
import { epNum, pad2, plural } from '../lib/format'
import { useDoc, useStore } from '../store'
import type { BlockType, Doc } from '../types'

const BLOCK_BTNS: { t: BlockType; prefix?: string; label: string; hint: string; hot?: boolean }[] = [
  { t: 'scene', prefix: 'INT. ', label: 'INT.', hint: 'Cabeçalho de cena interna — Ctrl+1' },
  { t: 'scene', prefix: 'EXT. ', label: 'EXT.', hint: 'Cabeçalho de cena externa — Ctrl+2' },
  { t: 'scene', prefix: 'INT./EXT. ', label: 'INT./EXT.', hint: 'Cena mista' },
  { t: 'action', label: 'Ação', hint: 'Ctrl+3' },
  { t: 'character', label: 'Personagem', hint: 'Ctrl+4' },
  { t: 'paren', prefix: '(', label: '(paren.)', hint: 'Ctrl+5' },
  { t: 'dialog', label: 'Diálogo', hint: 'Ctrl+6' },
  { t: 'transition', prefix: 'CORTA PARA:', label: 'Transição', hint: 'Ctrl+7' },
  { t: 'note', prefix: '[[ ', label: 'Nota', hint: 'Lembrete que não entra na exportação limpa' },
  { t: 'gap', prefix: '??? ', label: '??? Buraco', hint: 'Não sei como continuar — Ctrl+J', hot: true },
]

const SHORTCUTS = [
  'Ctrl+K — inserir ligação',
  'Ctrl+\\ — esconder painel',
  'Ctrl+J — marcar buraco',
  'Ctrl+Shift+J (ou Alt+J) — próximo buraco',
  'Enter — próximo bloco',
  'Tab / Shift+Tab — muda o tipo do bloco',
  'Ctrl+1/2 — INT. / EXT.',
  'Ctrl+3 — ação · Ctrl+4 — personagem',
  'Ctrl+5 — parêntese · Ctrl+6 — diálogo',
  'Ctrl+7 — transição',
]

interface Stats {
  words: number
  pages: number
  scenes: { pos: number; title: string }[]
  gaps: { pos: number; text: string; stage: number }[]
}

function readStats(editor: Editor): Stats {
  const scenes: Stats['scenes'] = []
  const gaps: Stats['gaps'] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'block') return true
    if (node.attrs.t === 'scene') scenes.push({ pos, title: node.textContent.trim() || '(cena sem título)' })
    if (node.attrs.t === 'gap') gaps.push({ pos, text: node.textContent.replace(/^\?+\s*/, '').trim() || '(sem descrição)', stage: node.attrs.stage ?? -1 })
    return false
  })
  const words = editor.state.doc.textContent.match(/\S+/g)?.length ?? 0
  const pages = Math.max(1, Math.round(editor.view.dom.scrollHeight / 940))
  return { words, pages, scenes, gaps }
}

const readPanelPref = () => { try { return localStorage.getItem('enredo-panel') !== '0' } catch { return true } }

export default function WritingPage() {
  const { docId = '' } = useParams()
  const doc = useDoc(docId)
  if (!doc)
    return (
      <div className="fixed inset-0 z-[200] grid place-items-center bg-editor-desk text-center">
        <div>
          <p className="font-serif text-[32px]">Esse texto não existe mais.</p>
          <Link to="/textos" className="text-[13px] font-semibold underline">Ver todos os textos</Link>
        </div>
      </div>
    )
  return <Writer key={doc.id} doc={doc} />
}

function Writer({ doc }: { doc: Doc }) {
  const navigate = useNavigate()
  const ep = useStore((s) => s.episodes.find((e) => e.id === doc.episodeId))
  const serie = useStore((s) => s.series.find((x) => x.id === ep?.serieId))
  const siblings = useStore(useShallow((s) => s.docs.filter((d) => d.episodeId === doc.episodeId && d.phase === doc.phase).sort((a, b) => a.createdAt - b.createdAt)))
  const updateDoc = useStore((s) => s.updateDoc)

  const [panel, setPanel] = useState(readPanelPref)
  const [saved, setSaved] = useState<'salvo' | 'digitando…' | 'salvo agora'>('salvo')
  const [stats, setStats] = useState<Stats>({ words: 0, pages: 1, scenes: [], gaps: [] })
  const scroller = useRef<HTMLDivElement>(null)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: editorExtensions,
    content: doc.content,
    editorProps: { attributes: { class: 'script-editor', spellcheck: 'true', 'aria-label': 'Página do roteiro' } },
    onUpdate: ({ editor }) => {
      setSaved('digitando…')
      setStats(readStats(editor))
      if (pending.current) clearTimeout(pending.current)
      pending.current = setTimeout(() => {
        pending.current = null
        updateDoc(doc.id, { content: editor.getJSON() })
        setSaved('salvo agora')
      }, 600)
    },
  })

  useEffect(() => { if (editor) setStats(readStats(editor)) }, [editor])

  // Salva o que estiver pendente ao sair.
  useEffect(() => () => {
    if (pending.current && editor && !editor.isDestroyed) {
      clearTimeout(pending.current)
      useStore.getState().updateDoc(doc.id, { content: editor.getJSON() })
    }
  }, [editor, doc.id])

  const togglePanel = useCallback(() => setPanel((p) => {
    try { localStorage.setItem('enredo-panel', p ? '0' : '1') } catch { /* sem storage */ }
    return !p
  }), [])

  /** Rola até o bloco em `pos`, põe o cursor no fim dele e, se pedir, pisca. */
  const jumpTo = useCallback((pos: number, flash = false) => {
    if (!editor) return
    const node = editor.state.doc.nodeAt(pos)
    const dom = editor.view.nodeDOM(pos) as HTMLElement | null
    if (!node || !dom) return
    const box = scroller.current
    if (box) box.scrollTop += dom.getBoundingClientRect().top - box.getBoundingClientRect().top - 60
    editor.chain().setTextSelection(pos + node.nodeSize - 1).focus(undefined, { scrollIntoView: false }).run()
    if (flash) dom.animate?.([{ background: '#ffd84a' }, { background: '#fff3b8' }], { duration: 900 })
  }, [editor])

  const nextGap = useCallback(() => {
    if (!editor) return
    const gaps = readStats(editor).gaps
    if (!gaps.length) return
    const from = editor.state.selection.from
    jumpTo((gaps.find((g) => g.pos + 1 > from) ?? gaps[0]).pos, true)
  }, [editor, jumpTo])

  const cycleStage = (pos: number) => {
    if (!editor) return
    const node = editor.state.doc.nodeAt(pos)
    if (!node) return
    const s = node.attrs.stage ?? -1
    const next = s >= 11 ? null : s + 1
    editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, stage: next }))
  }

  // Vindo de "abrir" num buraco (?buraco=N): rola até ele e pisca.
  const [params, setParams] = useSearchParams()
  const gapParam = params.get('buraco')
  useEffect(() => {
    if (!editor || gapParam == null) return
    const g = readStats(editor).gaps[Number(gapParam)]
    const t = setTimeout(() => {
      if (g) jumpTo(g.pos, true)
      setParams((p) => { p.delete('buraco'); return p }, { replace: true })
    }, 60)
    return () => clearTimeout(t)
  }, [editor, gapParam, jumpTo, setParams])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === '\\') { e.preventDefault(); togglePanel() }
      else if ((mod && e.shiftKey && e.key.toLowerCase() === 'j') || (e.altKey && e.code === 'KeyJ')) { e.preventDefault(); nextGap() }
      else if (mod && e.key.toLowerCase() === 'j' && !editor?.isFocused) { e.preventDefault(); editor?.chain().focus('end').insertGap().run() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePanel, nextGap, editor])

  const leave = () => navigate(ep ? `/h/${ep.serieId}/ep/${ep.id}/fase/${doc.phase}` : '/textos')

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-editor-desk">
      <TopBar
        doc={doc}
        editor={editor}
        sub={`${serie && ep ? `${serie.title} · ep. ${epNum(ep.num)} · ` : ''}${doc.format}`}
        panel={panel}
        onTogglePanel={togglePanel}
        onLeave={leave}
      />

      <div className="flex min-h-0 flex-1">
        {panel && (
          <aside className="w-[266px] shrink-0 overflow-x-hidden overflow-y-auto border-r border-line bg-paper px-4 py-5">
            <div className="mb-2.5 label-caps">Cenas</div>
            <div className="flex flex-col gap-[3px]">
              {stats.scenes.map((s, i) => (
                <button key={s.pos} type="button" onClick={() => jumpTo(s.pos)} className="flex min-w-0 items-center gap-[9px] rounded-[12px] px-2.5 py-2 text-left font-mono text-[11.5px] text-ink/80 hover:bg-rail/9">
                  <span className="text-ink/42">{pad2(i + 1)}</span>
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
              {!stats.scenes.length && <div className="px-2.5 text-[12px] text-ink-muted">Nenhuma cena ainda (Ctrl+1).</div>}
            </div>

            <div className="mt-[18px] mb-[9px] flex items-center gap-2 border-t border-line-strong/70 pt-4">
              <span className="text-[11px] font-bold tracking-[.12em] text-[#8a5a00] uppercase">Buracos</span>
              <span className="rounded-full border border-dashed border-gap-line bg-gap-bg px-2 py-0.5 font-mono text-[11px] font-bold text-gap-ink">{stats.gaps.length}</span>
              <button type="button" onClick={nextGap} title="Ctrl+Shift+J ou Alt+J" className="ml-auto text-[11px] font-semibold text-[#8a5a00] hover:underline">próximo ↓</button>
            </div>
            <div className="flex flex-col gap-1.5">
              {stats.gaps.map((g) => (
                <div key={g.pos} className="rounded-[12px] border-[1.5px] border-dashed border-gap-line bg-gap-bg px-2.5 py-2">
                  <button type="button" onClick={() => jumpTo(g.pos, true)} className="block text-left text-[12px] leading-[1.3] text-gap-ink italic">{g.text}</button>
                  <button
                    type="button"
                    onClick={() => cycleStage(g.pos)}
                    title="Clique pra escolher a etapa da jornada"
                    className="mt-1.5 inline-block rounded-full border border-gap-line px-2 py-[3px] font-mono text-[10px]"
                    style={g.stage >= 0 ? { background: '#2a1b12', color: '#f7ecdc' } : { color: '#8a5a00' }}
                  >
                    {g.stage >= 0 ? `${pad2(g.stage + 1)} ${JOURNEY[g.stage]}` : 'ligar à jornada'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11px] leading-[1.4] text-ink-muted">
              Travou? <b className="font-mono">Ctrl+J</b> marca o buraco e você segue escrevendo.
            </div>

            <div className="mt-[18px] mb-[9px] border-t border-line-strong/70 pt-4 label-caps">Outros textos desta fase</div>
            <div className="flex flex-col gap-1">
              {siblings.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => navigate('/texto/' + v.id)}
                  className={`truncate rounded-[12px] px-2.5 py-2 text-left text-[12.5px] text-ink hover:bg-rail/9 ${v.id === doc.id ? 'bg-rail/12 font-semibold' : ''}`}
                >
                  {v.title}
                </button>
              ))}
            </div>

            <div className="mt-[18px] border-t border-line-strong/70 pt-4 font-mono text-[11px] leading-[1.8] text-ink-muted">
              {SHORTCUTS.map((s) => <div key={s}>{s}</div>)}
            </div>
          </aside>
        )}

        <div ref={scroller} className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-[clamp(12px,2vw,24px)] pt-[34px] pb-[120px]">
          {!panel && (
            <button
              type="button"
              onClick={togglePanel}
              title="Mostrar painel (Ctrl+\)"
              aria-label="Mostrar painel"
              className="sticky top-0 float-left -ml-[14px] flex h-16 w-[26px] items-center justify-center rounded-r-[12px] bg-paper text-[15px] text-rail shadow-[0_10px_20px_-12px_rgba(35,18,9,.7)]"
            >
              ›
            </button>
          )}
          <div className="mx-auto max-w-[880px] rounded-lg bg-paper-2 shadow-[0_26px_60px_-30px_rgba(35,18,9,.6)]" onClick={(e) => { if (e.target === e.currentTarget) editor?.commands.focus('end') }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center gap-[18px] border-t border-line bg-paper-2 px-[22px] py-2 font-mono text-[11px] text-ink/58">
        <span>{plural(stats.words, 'palavra', 'palavras')}</span>
        <span>~{plural(stats.pages, 'página', 'páginas')}</span>
        <span>{plural(stats.scenes.length, 'cena', 'cenas')}</span>
        <button type="button" onClick={nextGap} className="rounded-full border border-dashed border-gap-line bg-gap-bg px-[9px] py-px text-[#8a5a00]">
          {plural(stats.gaps.length, 'buraco', 'buracos')}
        </button>
        <span className="ml-auto" aria-live="polite">{saved}</span>
      </footer>
    </div>
  )
}

function TopBar({ doc, editor, sub, panel, onTogglePanel, onLeave }: { doc: Doc; editor: Editor | null; sub: string; panel: boolean; onTogglePanel: () => void; onLeave: () => void }) {
  const navigate = useNavigate()
  const updateDoc = useStore((s) => s.updateDoc)
  const phase = phaseOf(doc.phase)
  const [saveOpen, setSaveOpen] = useState(false)
  const saveBox = useRef<HTMLDivElement>(null)
  useClickOutside(saveBox, () => setSaveOpen(false), saveOpen)

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      italic: e?.isActive('italic') ?? false,
      underline: e?.isActive('underline') ?? false,
      list: e?.isActive('bulletList') ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  })

  const save = (kind: 'txt' | 'fountain' | 'html') => {
    if (!editor) return
    exportDoc(kind, doc.title, editor.getJSON(), editor.getHTML())
    setSaveOpen(false)
  }

  const run = (fn: (e: Editor) => void) => (ev: React.MouseEvent) => {
    ev.preventDefault()
    if (editor) fn(editor)
  }

  const markBtn = 'flex size-8 items-center justify-center rounded-[10px] font-serif text-[17px] text-ink/72 hover:bg-rail/10 disabled:opacity-35'
  const on = 'bg-rail/12 text-ink'

  return (
    <div className="shrink-0 border-b border-line bg-paper-2">
      <div className="flex items-center gap-[14px] px-[22px] py-3">
        <button type="button" onClick={onLeave} className="inline-flex shrink-0 items-center gap-[7px] text-[12.5px] font-semibold text-ink/70 hover:text-ink">
          <ArrowLeft size={15} strokeWidth={2.4} /> Sair da escrita
        </button>
        <span className="h-6 w-px bg-rail/16" />
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="max-w-[40%] min-w-[120px] font-serif text-[23px] text-ink">
            <InlineEdit value={doc.title} onSave={(title) => updateDoc(doc.id, { title })} className="truncate" />
          </span>
          <span className="shrink-0 rounded-full px-2.5 py-[5px] text-[10.5px] font-bold tracking-[.08em] uppercase" style={{ background: phase.color, color: phase.ink }}>{phase.title}</span>
          <span className="truncate text-[12px] text-ink-muted">{sub}</span>
        </span>
        <button
          type="button"
          onClick={onTogglePanel}
          title="Esconder/mostrar painel (Ctrl+\)"
          className={`flex h-[34px] shrink-0 items-center gap-[7px] rounded-[11px] px-3 text-[12.5px] font-semibold whitespace-nowrap text-ink/70 hover:bg-rail/10 ${panel ? '' : 'bg-rail/8'}`}
        >
          <PanelLeft size={17} /> {panel ? 'Esconder painel' : 'Mostrar painel'}
        </button>
        <div ref={saveBox} className="relative flex shrink-0 gap-2">
          <button type="button" onClick={() => setSaveOpen((o) => !o)} aria-expanded={saveOpen} className="inline-flex items-center gap-2 rounded-full bg-rail/8 px-4 py-[9px] text-[13px] font-semibold whitespace-nowrap text-rail hover:bg-rail/16">
            <Download size={15} /> Salvar no PC
          </button>
          <button type="button" onClick={() => navigate('/maturando?doc=' + doc.id)} className="inline-flex items-center gap-2 rounded-full bg-ph-maturacao px-4 py-[9px] text-[13px] font-semibold whitespace-nowrap text-[#eafaf3] hover:bg-[#0b564d]">
            <Clock3 size={15} /> Mandar maturar
          </button>
          {saveOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 z-[60] w-64 rounded-[18px] bg-paper-2 p-2 shadow-[0_26px_50px_-18px_rgba(35,18,9,.55)]">
              {([
                ['txt', 'Texto (.txt)', 'formatação de roteiro em espaços'],
                ['fountain', 'Fountain (.fountain)', 'abre em Final Draft, Highland, Arc'],
                ['html', 'Página (.html)', 'mantém negrito, itálico e margens'],
              ] as const).map(([k, label, hint]) => (
                <button key={k} type="button" onClick={() => save(k)} className="block w-full rounded-[13px] px-[13px] py-[11px] text-left hover:bg-rail/8">
                  <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink/58">{hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-[22px] pb-[11px]">
        <button type="button" title="Negrito (Ctrl+B)" onMouseDown={run((e) => e.chain().focus().toggleBold().run())} className={`${markBtn} font-bold ${active?.bold ? on : ''}`}>B</button>
        <button type="button" title="Itálico (Ctrl+I)" onMouseDown={run((e) => e.chain().focus().toggleItalic().run())} className={`${markBtn} italic ${active?.italic ? on : ''}`}>I</button>
        <button type="button" title="Sublinhado (Ctrl+U)" onMouseDown={run((e) => e.chain().focus().toggleUnderline().run())} className={`${markBtn} underline ${active?.underline ? on : ''}`}>U</button>
        <button type="button" title="Lista" onMouseDown={run((e) => e.chain().focus().toggleBulletList().run())} className={`${markBtn} ${active?.list ? on : ''}`}>•</button>
        <button type="button" title="Desfazer (Ctrl+Z)" disabled={!active?.canUndo} onMouseDown={run((e) => e.chain().focus().undo().run())} className={markBtn}><Undo2 size={16} /></button>
        <button type="button" title="Refazer (Ctrl+Shift+Z)" disabled={!active?.canRedo} onMouseDown={run((e) => e.chain().focus().redo().run())} className={markBtn}><Redo2 size={16} /></button>
        <button type="button" title="Ligar a um post-it, etapa, episódio… (Ctrl+K) — chega na etapa 7" disabled className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-link-bg px-[11px] text-[12.5px] font-bold text-link opacity-60">
          <Link2 size={14} strokeWidth={2.2} /> Ligação
        </button>
        <span className="mx-2 h-[22px] w-px bg-rail/16" />
        {BLOCK_BTNS.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.hint}
            onMouseDown={run((e) => e.chain().focus().setBlockType(b.t, b.prefix).run())}
            className={`rounded-full border-[1.5px] px-3 py-[7px] font-mono text-[11px] font-bold tracking-[.06em] uppercase hover:border-ink hover:bg-ink hover:text-paper ${b.hot ? 'border-gap-line bg-gap-bg text-gap-ink' : 'border-line-strong text-rail'}`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
