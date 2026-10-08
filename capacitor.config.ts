import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.enredo.app',
  appName: 'Enredo',
  webDir: 'dist',
  backgroundColor: '#a8734f',
  android: {
    // Android 15 desenha atrás das barras do sistema: o app ganha margens para não ficar embaixo delas.
    adjustMarginsForEdgeToEdge: 'force',
  },
}

export default config
