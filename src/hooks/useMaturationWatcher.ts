import { useEffect } from 'react'
import { useStore } from '../store'

/** Avisa (no app e, se permitido, no sistema) quando um texto termina de maturar. */
export function useMaturationWatcher() {
  const hydrated = useStore((s) => s.hydrated)
  useEffect(() => {
    if (!hydrated) return
    const check = () => {
      const s = useStore.getState()
      const now = Date.now()
      const done = s.docs.filter((d) => d.lockedAt && d.lockedUntil && d.lockedUntil <= now && !d.unlockNotified)
      for (const d of done) {
        s.updateDoc(d.id, { unlockNotified: true }, { touch: false })
        s.showToast(`"${d.title}" terminou de maturar.`, { label: 'Reler', to: '/texto/' + d.id })
        try {
          if ('Notification' in window && Notification.permission === 'granted') new Notification('Enredo', { body: `"${d.title}" terminou de maturar. Pode reler.`, icon: '/pwa-192.png' })
        } catch { /* alguns navegadores só notificam pelo service worker */ }
      }
    }
    check()
    const t = setInterval(check, 15_000)
    return () => clearInterval(t)
  }, [hydrated])
}
