import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export const ruled = 'w-full resize-y border-0 bg-[repeating-linear-gradient(#fffdf7_0_25px,rgba(58,35,24,.1)_25px_26px)] font-script text-[13px] leading-[26px] text-ink outline-none placeholder:text-ink/35'

export function Stepper({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const btn = 'flex size-[30px] items-center justify-center rounded-[10px] bg-rail/10 hover:bg-rail/18'
  return (
    <span className="ml-auto flex gap-1.5">
      <button type="button" aria-label="Anterior" onClick={onPrev} className={btn}><ChevronLeft size={16} /></button>
      <button type="button" aria-label="Próximo" onClick={onNext} className={btn}><ChevronRight size={16} /></button>
    </span>
  )
}

export function Meta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`font-mono text-[11.5px] text-ink/60 ${className}`}>{children}</div>
}
