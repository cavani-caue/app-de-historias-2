import { pad2 } from '../lib/format'

export function Clock({ parts }: { parts: [number, string][] }) {
  return (
    <div className="ml-auto flex gap-2.5">
      {parts.map(([v, l]) => (
        <div key={l} className="min-w-[72px] rounded-[16px] bg-[rgba(2,28,24,.32)] py-3 text-center">
          <div className="font-mono text-[26px] font-bold text-[#eafaf3]">{pad2(v)}</div>
          <div className="mt-[3px] text-[9.5px] tracking-[.12em] text-[#eafaf3]/70 uppercase">{l}</div>
        </div>
      ))}
    </div>
  )
}
