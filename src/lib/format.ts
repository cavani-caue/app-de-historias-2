export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')
export const epNum = (n: number) => pad2(n)

/** "agora", "há 5 min", "hoje", "ontem", "há 3 dias", "há 2 semanas"… */
export function ago(ts: number, now = Date.now()) {
  const diff = now - ts
  const min = 6e4, hour = 36e5, day = 864e5
  if (diff < min) return 'agora'
  if (diff < hour) return `há ${Math.floor(diff / min)} min`
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0)
  if (ts >= d0.getTime()) return 'hoje'
  if (ts >= d0.getTime() - day) return 'ontem'
  const days = Math.floor(diff / day)
  if (days < 14) return `há ${days} dias`
  if (days < 60) return `há ${Math.floor(days / 7)} semanas`
  return `há ${Math.floor(days / 30)} meses`
}

export interface Countdown { days: number; hours: number; min: number; sec: number; left: number }
export function countdown(until: number, now = Date.now()): Countdown {
  const left = Math.max(0, until - now)
  return { left, days: Math.floor(left / 864e5), hours: Math.floor((left % 864e5) / 36e5), min: Math.floor((left % 36e5) / 6e4), sec: Math.floor((left % 6e4) / 1000) }
}
export const shortLeft = (c: Countdown) => `${c.days}d ${pad2(c.hours)}h`

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
