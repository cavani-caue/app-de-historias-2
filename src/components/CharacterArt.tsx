import { ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import { isImage } from '../hooks/useImageDrop'

/** Só o PNG do personagem (ou o lugar vazio dele). O pai posiciona e aplica o "vazamento" no hover. */
export function CharacterImg({ url, placeholder, ink = 'rgba(42,27,18,.6)', subtle }: { url?: string; placeholder: string; ink?: string; subtle?: boolean }) {
  if (url) return <img src={url} alt="" draggable={false} className="pointer-events-none size-full object-contain select-none" />
  return (
    <div className={`flex size-full items-center justify-center rounded-[14px] border-2 border-dashed px-4 text-center text-[11.5px] font-semibold ${subtle ? 'opacity-0 transition-opacity group-hover:opacity-70' : 'opacity-70'}`} style={{ borderColor: ink, color: ink }}>
      {placeholder}
    </div>
  )
}

export interface ArtAction {
  label: string
  hint?: string
  upload?: (file: File) => void
  run?: () => void
}


/** Botão pequeno (aparece no hover do card) para enviar/trocar o PNG. Com mais de uma ação, abre um menu. */
export function ArtButton({ actions, ink = '#2a1b12', bg = 'rgba(255,253,247,.85)' }: { actions: ArtAction[]; ink?: string; bg?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const pending = useRef<ArtAction | null>(null)
  useClickOutside(box, () => setOpen(false), open)

  const pick = (a: ArtAction) => {
    setOpen(false)
    if (a.upload) { pending.current = a; input.current?.click() } else a.run?.()
  }

  return (
    <div ref={box} className="absolute top-2.5 right-2.5 z-40" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="Personagem (PNG)"
        aria-label="Enviar personagem (PNG)"
        onClick={() => (actions.length === 1 ? pick(actions[0]) : setOpen((o) => !o))}
        className="flex size-8 items-center justify-center rounded-full opacity-0 shadow-btn transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        style={{ background: bg, color: ink }}
      >
        <ImagePlus size={15} />
      </button>
      {open && (
        <div className="absolute top-10 right-0 w-60 rounded-[16px] bg-paper-2 p-2 shadow-pop">
          {actions.map((a) => (
            <button key={a.label} type="button" onClick={() => pick(a)} className="block w-full rounded-[11px] px-3 py-2 text-left text-[13px] text-ink hover:bg-ink/8">
              {a.label}
              {a.hint && <span className="block text-[11px] text-ink-muted">{a.hint}</span>}
            </button>
          ))}
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (isImage(f)) pending.current?.upload?.(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
