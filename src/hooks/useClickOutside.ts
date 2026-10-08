import { useEffect, type RefObject } from 'react'

export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const down = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOutside() }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onOutside() }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key) }
  }, [ref, onOutside, active])
}
