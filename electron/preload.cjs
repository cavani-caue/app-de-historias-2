// Só sinaliza para o app que ele está rodando no PC (sem service worker etc.).
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('enredoDesktop', { platform: process.platform })
