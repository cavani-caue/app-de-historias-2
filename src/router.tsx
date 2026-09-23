import { createBrowserRouter, Outlet, useParams } from 'react-router'
import { Placeholder } from './components/ui'
import { AppShell } from './layout/AppShell'
import SeriesPage from './pages/SeriesPage'
import { useStore } from './store'

function Root() {
  const hydrated = useStore((s) => s.hydrated)
  if (!hydrated) return <div className="grid min-h-screen place-items-center font-serif text-[28px] text-paper">Enredo…</div>
  return <Outlet />
}

function SerieStub() {
  const { serieId } = useParams()
  const title = useStore((s) => s.series.find((x) => x.id === serieId)?.title ?? 'História')
  return <Placeholder title={title} etapa={2} back={{ to: '/', label: 'Histórias' }} />
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <SeriesPage /> },
          { path: 'h/:serieId', element: <SerieStub /> },
          { path: 'h/:serieId/ideias', element: <Placeholder title="Ideação da história" etapa={4} /> },
          { path: 'h/:serieId/plano', element: <Placeholder title="Planejamento da história" etapa={4} /> },
          { path: 'h/:serieId/ep/:epId', element: <Placeholder title="Episódio" etapa={2} /> },
          { path: 'h/:serieId/ep/:epId/plano', element: <Placeholder title="Planejamento do episódio" etapa={4} /> },
          { path: 'h/:serieId/ep/:epId/fase/:phaseId', element: <Placeholder title="Fase" etapa={2} /> },
          { path: 'textos', element: <Placeholder title="Todos os textos" etapa={2} /> },
          { path: 'quadro', element: <Placeholder title="Quadro geral" etapa={2} /> },
          { path: 'maturando', element: <Placeholder title="Maturando" etapa={8} /> },
          { path: '*', element: <Placeholder title="Página não encontrada" /> },
        ],
      },
      { path: 'texto/:docId', element: <Placeholder title="Escrita" etapa={3} /> },
    ],
  },
])
