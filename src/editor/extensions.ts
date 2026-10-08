import Document from '@tiptap/extension-document'
import { ListItem } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'
import { LinkChip } from './LinkChip'
import { ScreenplayBlock } from './ScreenplayBlock'

/** Documento de roteiro: só blocos tipados (e listas de blocos). */
const ScriptDocument = Document.extend({ content: '(block | bulletList)+' })
const ScriptListItem = ListItem.extend({ content: 'block' })

export const editorExtensions = [
  ScriptDocument,
  ScreenplayBlock,
  ScriptListItem,
  LinkChip,
  StarterKit.configure({
    document: false,
    paragraph: false,
    heading: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    horizontalRule: false,
    orderedList: false,
    listItem: false,
    listKeymap: false,
    link: false,
    strike: false,
    trailingNode: false,
    dropcursor: false,
    gapcursor: false,
  }),
]
