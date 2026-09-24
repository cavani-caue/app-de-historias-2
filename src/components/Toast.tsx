import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '../store'

export function Toast() {
  const toast = useStore((s) => s.toast)
  const hide = useStore((s) => s.hideToast)
  const navigate = useNavigate()
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(hide, toast.action ? 9000 : 4500)
    return () => clearTimeout(t)
  }, [toast, hide])
  if (!toast) return null
  return (
    <div role="status" aria-live="polite" className="fixed bottom-[22px] left-1/2 z-[800] flex max-w-[min(560px,92vw)] -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2.5 pr-2.5 pl-5 text-[13px] text-paper shadow-pop">
      <span className="min-w-0">{toast.msg}</span>
      {toast.action && (
        <button type="button" onClick={() => { navigate(toast.action!.to); hide() }} className="shrink-0 rounded-full bg-paper px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-white">
          {toast.action.label}
        </button>
      )}
      <button type="button" aria-label="Fechar aviso" onClick={hide} className="shrink-0 rounded-full p-1 text-paper/70 hover:text-paper"><X size={14} /></button>
    </div>
  )
}
