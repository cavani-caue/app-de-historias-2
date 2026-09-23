import { Outlet } from 'react-router'
import { useStore } from '../store'

export function Root() {
  const hydrated = useStore((s) => s.hydrated)
  if (!hydrated) return <div className="grid min-h-screen place-items-center font-serif text-[28px] text-paper">Enredo…</div>
  return <Outlet />
}
