import { ArrowLeft, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

export function PageHeader({ title, sub, action, back }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; back?: { to: string; label: string } }) {
  return (
    <>
      {back && <BackLink to={back.to} label={back.label} />}
      <header className="mb-[26px] flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="m-0 font-serif text-[56px] leading-none font-normal text-ink">{title}</h1>
          {sub && <p className="mt-2 mb-0 text-[14px] text-ink-soft">{sub}</p>}
        </div>
        {action}
      </header>
    </>
  )
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="mb-3 inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-ink/70! hover:text-ink!">
      <ArrowLeft size={14} strokeWidth={2.4} />
      {label}
    </Link>
  )
}

export function PrimaryButton({ children, onClick, small }: { children: ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-ink font-semibold whitespace-nowrap text-paper shadow-btn hover:bg-black ${small ? 'px-[18px] py-[11px] text-[13px]' : 'px-[22px] py-[13px] text-[14px]'}`}
    >
      <Plus size={small ? 15 : 17} strokeWidth={2.4} />
      {children}
    </button>
  )
}

export function Placeholder({ title, etapa, back }: { title: string; etapa?: number; back?: { to: string; label: string } }) {
  return (
    <div>
      <PageHeader title={title} sub={etapa ? `Esta tela chega na etapa ${etapa}.` : 'Nada por aqui.'} back={back} />
      <div className="rounded-card border-2 border-dashed border-paper/70 p-10 text-center text-[13px] font-semibold text-paper/90">Em construção</div>
    </div>
  )
}

export function Pill({ children, bg, fg, onClick, title, className = '' }: { children: ReactNode; bg: string; fg: string; onClick?: () => void; title?: string; className?: string }) {
  const cls = `inline-flex shrink-0 items-center rounded-full px-[10px] py-[5px] text-[10.5px] font-bold tracking-[.08em] whitespace-nowrap uppercase ${className}`
  if (onClick)
    return (
      <button type="button" title={title} onClick={(e) => { e.stopPropagation(); onClick() }} className={`${cls} hover:brightness-95`} style={{ background: bg, color: fg }}>
        {children}
      </button>
    )
  return <span title={title} className={cls} style={{ background: bg, color: fg }}>{children}</span>
}

/** Card colorido de entrada (Ideação, Planejamento, Brainstorming…) com o glifo "fantasma". */
export function EntryCard({ title, desc, foot, bg, ink, inkSoft, ghost, glyph, rule = '#f5c518', onClick }: {
  title: string; desc: string; foot?: ReactNode; bg: string; ink: string; inkSoft: string; ghost: string; glyph: string; rule?: string; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-col justify-start overflow-hidden rounded-[24px] p-[22px] text-left shadow-[0_20px_42px_-20px_rgba(35,18,9,.65)] transition-transform hover:-translate-y-1" style={{ background: bg }}>
      <span aria-hidden className="absolute -right-1.5 -bottom-8 font-display text-[110px] leading-none" style={{ color: ghost }}>{glyph}</span>
      <span className="relative block font-display text-[17px] uppercase" style={{ color: ink }}>{title}</span>
      <span className="relative mt-[9px] mb-[10px] block h-0.5 w-[30px]" style={{ background: rule }} />
      <span className="relative block text-[12.5px] leading-[1.4]" style={{ color: inkSoft }}>{desc}</span>
      {foot != null && <span className="relative mt-[14px] block font-mono text-[11px]" style={{ color: inkSoft }}>{foot}</span>}
    </button>
  )
}

/** Tile tracejado "Novo …" no fim das grades. */
export function DashedTile({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-paper/75 text-paper/90 hover:bg-paper/12 ${className}`}>
      <Plus size={26} strokeWidth={2} />
      <span className="text-[12.5px] font-semibold">{label}</span>
    </button>
  )
}

/** Texto editável no lugar (título, logline). Grava ao sair do campo ou com Enter. */
export function InlineEdit({ value, onSave, className = '', placeholder, multiline }: { value: string; onSave: (v: string) => void; className?: string; placeholder?: string; multiline?: boolean }) {
  const commit = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const v = el.value.trim()
    if (v !== value) onSave(v || value)
  }
  const common = {
    defaultValue: value,
    placeholder,
    onBlur: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => commit(e.currentTarget),
    className: `w-full min-w-0 border-0 bg-transparent p-0 outline-none focus:rounded-md focus:bg-paper-2/40 ${className}`,
  }
  if (multiline) return <textarea key={value} {...common} rows={2} className={`${common.className} resize-none`} />
  return <input key={value} {...common} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
}

export const sectionTitle = 'm-0 font-serif text-[34px] font-normal text-ink'
