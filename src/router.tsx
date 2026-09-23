import { createBrowserRouter } from 'react-router'
import { Placeholder } from './components/ui'
import { AppShell } from './layout/AppShell'
import { Root } from './layout/Root'
import BoardPage from './pages/BoardPage'
import DocsPage from './pages/DocsPage'
import EpisodePage from './pages/EpisodePage'
import NotFound from './pages/NotFound'
import PhasePage from './pages/PhasePage'
import SeriePage from './pages/SeriePage'
import IdeationPage from './pages/IdeationPage'
import PlanPage from './pages/PlanPage'
import SeriesPage from './pages/SeriesPage'
import WritingPage from './pages/WritingPage'

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
          { path: 'h/:serieId/plano', element: <PlanPage /> },
          { path: 'h/:serieId/ep/:epId', element: <EpisodePage /> },
          { path: 'h/:serieId/ep/:epId/plano', element: <PlanPage /> },
          { path: 'h/:serieId/ep/:epId/fase/:phaseId', element: <PhasePage /> },
          { path: 'textos', element: <DocsPage /> },
          { path: 'quadro', element: <BoardPage /> },
          { path: 'maturando', element: <Placeholder title="Maturando" etapa={8} /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      { path: 'texto/:docId', element: <WritingPage /> },
    ],
  },
])
