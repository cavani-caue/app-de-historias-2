import { createBrowserRouter } from 'react-router'
import { AppShell } from './layout/AppShell'
import { Root } from './layout/Root'
import BoardPage from './pages/BoardPage'
import DocsPage from './pages/DocsPage'
import EpisodePage from './pages/EpisodePage'
import NotFound from './pages/NotFound'
import PhasePage from './pages/PhasePage'
import SeriePage from './pages/SeriePage'
import IdeationPage from './pages/IdeationPage'
import MaturingPage from './pages/MaturingPage'
import SeriesPage from './pages/SeriesPage'

// Editor (TipTap) e quadros carregam sob demanda.
const planPage = () => import('./pages/PlanPage').then((m) => ({ Component: m.default }))
const writingPage = () => import('./pages/WritingPage').then((m) => ({ Component: m.default }))

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <SeriesPage /> },
          { path: 'h/:serieId', element: <SeriePage /> },
          { path: 'h/:serieId/ideias', element: <IdeationPage /> },
          { path: 'h/:serieId/plano', lazy: planPage },
          { path: 'h/:serieId/ep/:epId', element: <EpisodePage /> },
          { path: 'h/:serieId/ep/:epId/plano', lazy: planPage },
          { path: 'h/:serieId/ep/:epId/fase/:phaseId', element: <PhasePage /> },
          { path: 'textos', element: <DocsPage /> },
          { path: 'quadro', element: <BoardPage /> },
          { path: 'maturando', element: <MaturingPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      { path: 'texto/:docId', lazy: writingPage },
    ],
  },
])
