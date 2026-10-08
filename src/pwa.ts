import { registerSW } from 'virtual:pwa-register'
import { isPackagedApp } from './lib/platform'
import { useStore } from './store'

/** Service worker: atualiza sozinho e avisa quando o app já funciona offline. */
export function setupPWA() {
  // Nos apps de celular e PC os arquivos já vêm dentro do app: sem service worker.
  if (import.meta.env.DEV || isPackagedApp) return
  registerSW({
    immediate: true,
    onOfflineReady: () => useStore.getState().showToast('Pronto: o Enredo agora funciona offline.'),
  })
}
