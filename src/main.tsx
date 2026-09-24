import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/archivo-black/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/400-italic.css'
import '@fontsource/courier-prime/700.css'
import './index.css'
import { router } from './router'
import { setupPWA } from './pwa'
import { useStore } from './store'

useStore.getState().load()
setupPWA()
// Em desenvolvimento, o store fica acessível no console (útil para testar a maturação).
if (import.meta.env.DEV) Object.assign(window, { enredo: useStore })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
