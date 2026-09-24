import type { PMNode } from '../types'
import { docBlocks, type SimpleBlock } from './doc'

const WIDTH = 60

function wrap(text: string, width: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const w of para.split(/\s+/).filter(Boolean)) {
      if (line && (line + ' ' + w).length > width) { out.push(line); line = w } else line = line ? line + ' ' + w : w
    }
    out.push(line)
  }
  return out
}
const indent = (n: number, lines: string[]) => lines.map((l) => ' '.repeat(n) + l).join('\n')
const DIALOGUE = new Set(['character', 'paren', 'dialog'])

/** Roteiro formatado com espaços (Courier, 60 colunas). */
export function toTxt(blocks: SimpleBlock[]): string {
  const parts: string[] = []
  let prev = ''
  for (const b of blocks) {
    const s = b.text.trim()
    if (!s) continue
    const glue = (b.type === 'paren' || b.type === 'dialog') && DIALOGUE.has(prev)
    let out: string
    switch (b.type) {
      case 'scene': out = s.toUpperCase(); break
      case 'character': out = indent(22, [s.toUpperCase()]); break
      case 'paren': out = indent(16, wrap(s, 26)); break
      case 'dialog': out = indent(10, wrap(s, 35)); break
      case 'transition': out = ' '.repeat(Math.max(0, WIDTH - s.length)) + s.toUpperCase(); break
      case 'note': prev = b.type; continue // notas não entram na versão limpa
      case 'gap': out = wrap('[BURACO] ' + s.replace(/^\?+\s*/, ''), WIDTH).join('\n'); break
      default: out = wrap(s, WIDTH).join('\n')
    }
    parts.push((parts.length && !glue ? '\n' : '') + out)
    prev = b.type
  }
  return parts.join('\n') + '\n'
}

/** Fountain (https://fountain.io). */
export function toFountain(title: string, blocks: SimpleBlock[]): string {
  const parts: string[] = []
  let prev = ''
  for (const b of blocks) {
    const s = b.text.trim()
    if (!s) continue
    const glue = (b.type === 'paren' || b.type === 'dialog') && DIALOGUE.has(prev)
    let out: string
    switch (b.type) {
      case 'scene': out = /^(INT|EXT|EST|INT\.\/EXT|I\/E)[. ]/i.test(s) ? s.toUpperCase() : '.' + s.toUpperCase(); break
      case 'character': out = s === s.toUpperCase() ? s : '@' + s; break
      case 'paren': out = s.startsWith('(') ? s : `(${s})`; break
      case 'dialog': out = s; break
      case 'transition': out = '> ' + s.toUpperCase(); break
      case 'note': out = `[[${s.replace(/^\[\[\s*|\s*\]\]$/g, '')}]]`; break
      case 'gap': out = `[[??? ${s.replace(/^\?+\s*/, '')}]]`; break
      default: out = s.toUpperCase() === s && /[A-Z]/.test(s) ? '!' + s : s
    }
    parts.push((parts.length && !glue ? '\n' : '') + out)
    prev = b.type
  }
  return `Title: ${title}\n\n` + parts.join('\n') + '\n'
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const SCRIPT_CSS = `
.sb{font-family:'Courier Prime',ui-monospace,monospace;font-size:15.5px;line-height:1.62;color:#2a1b12;white-space:pre-wrap;margin:0 0 12px}
.sb-scene{margin:26px 0 12px;text-transform:uppercase;font-weight:700;letter-spacing:.02em}
.sb-character{margin:14px 0 0;padding-left:38%;text-transform:uppercase}
.sb-paren{margin:0;padding-left:31%;padding-right:30%;font-style:italic;color:rgba(42,27,18,.72)}
.sb-dialog{margin:0 0 12px;padding-left:22%;padding-right:24%}
.sb-transition{margin:14px 0 18px;text-align:right;text-transform:uppercase;font-weight:700}
.sb-note{font-style:italic;color:rgba(42,27,18,.45)}
.sb-gap{margin:12px 0 16px;padding:10px 14px;border:1.5px dashed #c98f00;border-radius:8px;background:#fff3b8;color:#5a3e00;font-style:italic}
.link-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 9px;margin:0 2px;border-radius:999px;background:#e6edff;color:#2c5bd1;font:600 12px system-ui,sans-serif}
`

/** Página HTML com negrito, itálico e margens (usa o HTML do editor). */
export function toHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>body{background:#e7dcc9;margin:0;padding:40px 16px}.page{max-width:880px;margin:0 auto;background:#fffdf7;border-radius:8px;padding:88px 104px 140px}${SCRIPT_CSS}</style>
</head><body><div class="page">${bodyHtml}</div></body></html>
`
}

export function download(name: string, body: string, mime: string) {
  const a = document.createElement('a')
  const url = URL.createObjectURL(new Blob([body], { type: mime }))
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export const safeName = (title: string) => title.replace(/[—–]/g, '-').replace(/[^\wÀ-ÿ .-]/g, '').replace(/\s+/g, ' ').trim() || 'texto'

export function exportDoc(kind: 'txt' | 'fountain' | 'html', title: string, content: PMNode, html: string) {
  const name = safeName(title)
  const blocks = docBlocks(content)
  if (kind === 'txt') return download(name + '.txt', toTxt(blocks), 'text/plain;charset=utf-8')
  if (kind === 'fountain') return download(name + '.fountain', toFountain(title, blocks), 'text/plain;charset=utf-8')
  return download(name + '.html', toHtml(title, html), 'text/html;charset=utf-8')
}
