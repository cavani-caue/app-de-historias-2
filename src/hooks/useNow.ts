import { useEffect, useState } from 'react'

/** Relógio que re-renderiza a cada `ms` (padrão 1s). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
