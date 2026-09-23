import { useState, type DragEvent } from 'react'

export const isImage = (f?: File | null): f is File => !!f && /^image\/(png|webp)$/.test(f.type)

/** Soltar um PNG em cima do card. */
export function useImageDrop(onFile: (f: File) => void) {
  const [over, setOver] = useState(false)
  return {
    over,
    handlers: {
      onDragOver: (e: DragEvent) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true) } },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files?.[0]
        if (isImage(f)) onFile(f)
      },
    },
  }
}
