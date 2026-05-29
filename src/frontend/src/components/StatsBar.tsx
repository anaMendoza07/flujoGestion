import type { Policy } from '../utils/priority'

interface Props {
  policies: Policy[]
}

export default function StatsBar({ policies }: Props) {
  const total    = policies.length
  const critical = policies.filter(p => p.priority_level === 'critical').length
  const high     = policies.filter(p => p.priority_level === 'high').length
  const renewable = policies.filter(p => p.is_renewable).length
  const renewed  = policies.filter(p => p.status === 'renewed').length

  const stats = [
    { label: 'Total pólizas', value: total,     color: 'text-stone-700',  bg: 'bg-stone-100' },
    { label: 'Críticas',      value: critical,  color: 'text-red-700',    bg: 'bg-red-50' },
    { label: 'Urgentes',      value: high,      color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Renovables',    value: renewable, color: 'text-amber-700',  bg: 'bg-amber-50' },
    { label: 'Renovadas',     value: renewed,   color: 'text-emerald-700',bg: 'bg-emerald-50' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
          <p className={`text-2xl font-bold ${s.color} leading-none`}>{s.value}</p>
          <p className="text-xs text-stone-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
