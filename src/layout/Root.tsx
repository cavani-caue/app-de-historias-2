import { Outlet } from 'react-router'
import { ReturnToText } from '../components/ReturnToText'
import { Toast } from '../components/Toast'
import { useMaturationWatcher } from '../hooks/useMaturationWatcher'
import { useStore } from '../store'

export function Root() {
  const hydrated = useStore((s) => s.hydrated)
  useMaturationWatcher()
  if (!hydrated) return <div className="grid min-h-screen place-items-center font-serif text-[28px] text-paper">Enredo…</div>
  return (
    <>
      <Outlet />
      <ReturnToText />
      <Toast />
    </>
  )
}
