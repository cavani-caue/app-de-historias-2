import { Node, mergeAttributes } from '@tiptap/core'
import type { LinkTarget } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkChip: {
      /** Insere o chip de ligação no lugar da seleção, seguido de um espaço. */
      insertLinkChip: (target: LinkTarget, label: string) => ReturnType
    }
  }
}

/** Chip inline, não editável: "↗ rótulo". Guarda o alvo em JSON. */
export const LinkChip = Node.create({
  name: 'link',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      target: {
        default: null,
        parseHTML: (el) => { try { return JSON.parse(decodeURIComponent(el.getAttribute('data-link') ?? '')) } catch { return null } },
        renderHTML: (a) => ({ 'data-link': encodeURIComponent(JSON.stringify(a.target)) }),
      },
      label: { default: '', parseHTML: (el) => el.getAttribute('data-label') ?? '', renderHTML: (a) => ({ 'data-label': a.label }) },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-link]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'link-chip', contenteditable: 'false' }), '↗ ' + node.attrs.label]
  },

  renderText({ node }) {
    return '↗ ' + node.attrs.label
  },

  addCommands() {
    return {
      insertLinkChip:
        (target, label) =>
        ({ chain }) =>
          chain().insertContent([{ type: 'link', attrs: { target, label } }, { type: 'text', text: ' ' }]).run(),
    }
  },
})
