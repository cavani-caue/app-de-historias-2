import { useCallback, useMemo } from 'react'
import { newPlan } from '../data/seed'
import { useStore } from '../store'
import type { Plan } from '../types'

export type PlanPatch = Partial<Plan> | ((p: Plan) => Partial<Plan>)

/** Plano de uma chave (serieId ou 'ep:'+id); cria com os padrões na primeira escrita. */
export function usePlan(key: string): [Plan, (patch: PlanPatch) => void] {
  const stored = useStore((s) => s.plans[key])
  const plan = useMemo(() => stored ?? newPlan(key), [stored, key])
  const update = useStore((s) => s.updatePlan)
  const set = useCallback((patch: PlanPatch) => update(key, patch), [update, key])
  return [plan, set]
}
