import { Clock, Columns2, Download, FileText, Kanban, Upload, type LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { downloadBackup, parseBackup, restoreBackup } from '../lib/backup'
import { plural } from '../lib/format'
import { useNow } from '../hooks/useNow'
import { useStore } from '../store'

interface RailItem {
  to: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

const ITEMS: RailItem[] = [
  { to: '/', label: 'Histórias', icon: Columns2, match: (p) => p === '/' || p.startsWith('/h/') },
  { to: '/textos', label: 'Todos os textos', icon: FileText, match: (p) => p.startsWith('/textos') },
  { to: '/maturando', label: 'Maturando', icon: Clock, match: (p) => p.startsWith('/maturando') },
  { to: '/quadro', label: 'Quadro geral', icon: Kanban, match: (p) => p.startsWith('/quadro') },
]

const railBtn = 'relative flex size-[46px] items-center justify-center rounded-[15px] transition-colors'

export function AppShell() {
  const { pathname } = useLocation()
  const now = useNow(30_000)
  const maturing = useStore((s) => s.docs.some((d) => (d.lockedUntil ?? 0) > now))
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const { showToast, reload } = useStore.getState()

  const saveBackup = async () => {
    try {
      const b = await downloadBackup()
      showToast(`Backup baixado: ${plural(b.series.length, 'história', 'histórias')}, ${plural(b.docs.length, 'texto', 'textos')}.`)
    } catch (e) {
      showToast('Não deu pra gerar o backup: ' + (e as Error).message)
    }
  }

  const openBackup = async (file: File) => {
    try {
      const b = parseBackup(await file.text())
      const when = b.exportedAt ? new Date(b.exportedAt).toLocaleString('pt-BR') : 'data desconhecida'
      if (!confirm(`Abrir o backup de ${when} (${plural(b.series.length, 'história', 'histórias')}, ${plural(b.docs.length, 'texto', 'textos')})?\n\nTudo o que está no app agora será substituído. Se quiser guardar o estado atual, baixe um backup antes.`)) return
      await restoreBackup(b)
      await reload()
      navigate('/')
      showToast('Backup aberto.')
    } catch (e) {
      showToast((e as Error).message)
    }
  }

  return (
    <div className="flex min-h-screen gap-[14px] p-[14px]">
      <aside className="sticky top-[14px] z-[60] flex h-[calc(100vh-28px)] w-[74px] shrink-0 flex-col items-center gap-2 rounded-rail bg-rail py-4 shadow-rail">
        <NavLink
          to="/"
          title="Enredo"
          className="mb-[10px] flex size-[42px] items-center justify-center rounded-[14px] bg-rail-active font-serif text-[24px] text-accent! hover:text-accent!"
        >
          E
        </NavLink>
        {ITEMS.map((it) => {
          const active = it.match(pathname)
          const Icon = it.icon
          return (
            <NavLink
              key={it.to}
              to={it.to}
              title={it.label}
              aria-label={it.label}
              className={`${railBtn} ${active ? 'bg-rail-active text-rail! hover:text-rail!' : 'text-rail-ink! hover:bg-rail-active/20 hover:text-rail-ink!'}`}
            >
              <Icon size={19} strokeWidth={2} />
              {it.to === '/maturando' && maturing && <span className="absolute top-[7px] right-[7px] size-[7px] rounded-full bg-gold" />}
            </NavLink>
          )
        })}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button type="button" onClick={saveBackup} title="Baixar backup (.json)" aria-label="Baixar backup" className={`${railBtn} text-rail-ink hover:bg-rail-active/16`}>
            <Download size={18} />
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} title="Abrir backup (.json)" aria-label="Abrir backup" className={`${railBtn} text-rail-ink hover:bg-rail-active/16`}>
            <Upload size={18} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) openBackup(f) }}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pt-[22px] pb-12">
        <Outlet />
      </main>
    </div>
  )
}
