import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { useStore } from '../store'

/** Pill azul fixa "← Voltar ao texto" enquanto o autor está fora do texto que ligou. */
export function ReturnToText() {
  const r = useStore((s) => s.returnTo)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  if (!r || pathname.startsWith('/texto/')) return null
  return (
    <button
      type="button"
      onClick={() => navigate('/texto/' + r.docId)}
      className="fixed right-[22px] bottom-[22px] z-[700] flex max-w-[min(420px,80vw)] items-center gap-2.5 rounded-full bg-link py-3 pr-5 pl-4 text-white shadow-[0_18px_36px_-14px_rgba(20,30,80,.7)] hover:brightness-110"
    >
      <ArrowLeft size={16} strokeWidth={2.4} />
      <span className="text-[13px] font-bold whitespace-nowrap">Voltar ao texto</span>
      <span className="truncate text-[12px] opacity-80">{r.label}</span>
    </button>
  )
}
