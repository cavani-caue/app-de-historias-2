import { Node, mergeAttributes, type Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { BLOCK_CYCLE, BLOCK_NEXT } from '../data/constants'
import type { BlockType } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    screenplay: {
      /** Muda o tipo do bloco atual; com `prefix`, preenche o bloco se estiver vazio. */
      setBlockType: (t: BlockType, prefix?: string) => ReturnType
      /** Insere um buraco depois do bloco atual e põe o cursor nele. */
      insertGap: () => ReturnType
    }
  }
}

/** Informações do bloco onde está o cursor. */
export function currentBlock(editor: Editor) {
  const { $from } = editor.state.selection
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === 'block') {
      return { node, pos: $from.before(d), depth: d, inList: $from.node(d - 1)?.type.name === 'listItem', t: node.attrs.t as BlockType }
    }
  }
  return null
}

export const ScreenplayBlock = Node.create({
  name: 'block',
  group: 'line',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      t: {
        default: 'action',
        parseHTML: (el) => el.getAttribute('data-t') || 'action',
        renderHTML: (a) => ({ 'data-t': a.t, class: `sb sb-${a.t}` }),
      },
      stage: {
        default: null,
        keepOnSplit: false,
        parseHTML: (el) => (el.getAttribute('data-stage') ? Number(el.getAttribute('data-stage')) : null),
        renderHTML: (a) => (a.stage == null ? {} : { 'data-stage': String(a.stage) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-t]' }, { tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBlockType:
        (t, prefix) =>
        ({ state, tr, dispatch }) => {
          const cur = currentBlockFromState(state)
          if (!cur) return false
          if (dispatch) {
            tr.setNodeMarkup(cur.pos, undefined, { ...cur.node.attrs, t, stage: t === 'gap' ? cur.node.attrs.stage : null })
            if (prefix && !cur.node.textContent.trim()) {
              const start = cur.pos + 1
              tr.replaceWith(start, start + cur.node.content.size, state.schema.text(prefix))
              tr.setSelection(TextSelection.create(tr.doc, start + prefix.length))
            }
          }
          return true
        },
      insertGap:
        () =>
        ({ state, tr, dispatch }) => {
          const cur = currentBlockFromState(state)
          const at = cur ? cur.pos + cur.node.nodeSize : state.doc.content.size
          const node = state.schema.nodes.block.create({ t: 'gap' }, state.schema.text('??? '))
          if (dispatch) {
            tr.insert(at, node)
            tr.setSelection(TextSelection.create(tr.doc, at + 1 + 4))
            tr.scrollIntoView()
          }
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    const cycle = (dir: 1 | -1) => () => {
      const cur = currentBlock(this.editor)
      if (!cur || cur.inList) return false
      const i = BLOCK_CYCLE.indexOf(cur.t)
      const next = BLOCK_CYCLE[(Math.max(i, 0) + (dir === 1 ? 1 : BLOCK_CYCLE.length - 1)) % BLOCK_CYCLE.length]
      return this.editor.commands.setBlockType(next)
    }
    const set = (t: BlockType, prefix?: string) => () => this.editor.commands.setBlockType(t, prefix)
    return {
      Enter: () => {
        const cur = currentBlock(this.editor)
        if (!cur || cur.inList) return false
        const next = BLOCK_NEXT[cur.t] ?? 'action'
        return this.editor.chain().splitBlock().setBlockType(next).scrollIntoView().run()
      },
      Tab: cycle(1),
      'Shift-Tab': cycle(-1),
      'Mod-1': set('scene', 'INT. '),
      'Mod-2': set('scene', 'EXT. '),
      'Mod-3': set('action'),
      'Mod-4': set('character'),
      'Mod-5': set('paren', '('),
      'Mod-6': set('dialog'),
      'Mod-7': set('transition', 'CORTA PARA:'),
      'Mod-j': () => this.editor.commands.insertGap(),
    }
  },
})

function currentBlockFromState(state: import('@tiptap/pm/state').EditorState) {
  const { $from } = state.selection
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === 'block') return { node, pos: $from.before(d) }
  }
  return null
}
