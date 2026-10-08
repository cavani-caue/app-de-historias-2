import { Capacitor } from '@capacitor/core'

/** App Android (Capacitor). */
export const isAndroidApp = Capacitor.isNativePlatform()
/** App de PC (Electron). O preload expõe `window.enredoDesktop`. */
export const isDesktopApp = typeof window !== 'undefined' && 'enredoDesktop' in window
/** Rodando como app instalado (sem service worker, sem pedir notificação do navegador). */
export const isPackagedApp = isAndroidApp || isDesktopApp

const toBase64 = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result).split(',')[1] ?? '')
    r.onerror = () => rej(r.error)
    r.readAsDataURL(blob)
  })

/**
 * Salva um arquivo do jeito de cada plataforma:
 * navegador e PC baixam (no PC abre o "Salvar como"); no Android grava e abre o
 * menu de compartilhar, para mandar ao Drive, Arquivos, WhatsApp etc.
 */
export async function saveFile(name: string, body: string | Blob, mime: string) {
  const blob = typeof body === 'string' ? new Blob([body], { type: mime }) : body
  if (isAndroidApp) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')])
    const { uri } = await Filesystem.writeFile({ path: name, data: await toBase64(blob), directory: Directory.Cache })
    try {
      await Share.share({ title: name, files: [uri], dialogTitle: 'Salvar ou enviar' })
    } catch (e) {
      // Fechar o menu sem escolher nada não é erro.
      if (!/cancel/i.test(String((e as Error)?.message ?? e))) throw e
    }
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
