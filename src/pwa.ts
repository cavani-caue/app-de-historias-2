import { registerSW } from 'virtual:pwa-register'
import { useStore } from './store'

/** Service worker: atualiza sozinho e avisa quando o app já funciona offline. */
export function setupPWA() {
  if (import.meta.env.DEV) return
  registerSW({
    immediate: true,
    onOfflineReady: () => useStore.getState().showToast('Pronto: o Enredo agora funciona offline.'),
  })
}
