import { PageHeader } from '../components/ui'

export default function NotFound() {
  return <PageHeader title="Não achei isso" sub="Pode ter sido apagado. Volte para as histórias." back={{ to: '/', label: 'Histórias' }} />
}
