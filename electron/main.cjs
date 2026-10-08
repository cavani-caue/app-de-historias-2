// App de PC do Enredo (Electron). Serve o build do Vite por um protocolo próprio
// (app://enredo/), assim o roteamento, o IndexedDB e os módulos funcionam como na web.
const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const DIST = path.join(__dirname, '..', 'dist')
const ORIGIN = 'app://enredo'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
])

// Uma janela só: abrir de novo traz a que já existe.
if (!app.requestSingleInstanceLock()) app.quit()

function serveDist() {
  protocol.handle('app', (req) => {
    const { pathname } = new URL(req.url)
    let file = path.normalize(path.join(DIST, decodeURIComponent(pathname)))
    // Fora da pasta do build ou rota do app (sem extensão) → index.html.
    if (!file.startsWith(DIST) || !path.extname(file)) file = path.join(DIST, 'index.html')
    return net.fetch(pathToFileURL(file).toString())
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 760,
    minHeight: 560,
    title: 'Enredo',
    backgroundColor: '#a8734f',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      spellcheck: true,
    },
  })
  win.webContents.session.setSpellCheckerLanguages(['pt-BR'])
  // Links externos abrem no navegador; nada de janelas novas dentro do app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(ORIGIN)) e.preventDefault()
  })
  win.loadURL(ORIGIN + '/')
  return win
}

app.setAppUserModelId('com.enredo.app')
Menu.setApplicationMenu(null)

app.on('second-instance', () => {
  const [win] = BrowserWindow.getAllWindows()
  if (win) { if (win.isMinimized()) win.restore(); win.focus() }
})

app.whenReady().then(() => {
  serveDist()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
