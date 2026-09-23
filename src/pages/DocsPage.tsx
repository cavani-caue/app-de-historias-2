import { useShallow } from 'zustand/react/shallow'
import { DocCard } from '../components/DocCard'
import { PageHeader } from '../components/ui'
import { useStore } from '../store'

export default function DocsPage() {
  const docs = useStore(useShallow((s) => [...s.docs].sort((a, b) => b.updatedAt - a.updatedAt)))
  return (
    <div>
      <PageHeader title="Todos os textos" sub={'Toda história, todo episódio, toda fase — num lugar só. Use "Ligar" pra mover um texto de episódio ou de fase.'} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {docs.map((d) => <DocCard key={d.id} doc={d} showPlace />)}
      </div>
      {!docs.length && <p className="text-[14px] text-ink-soft">Nenhum texto ainda. Abra um episódio e crie o primeiro.</p>}
    </div>
  )
}
