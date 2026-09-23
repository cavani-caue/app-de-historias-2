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
