import { Phone, RefreshCw, ChevronRight } from 'lucide-react'
import type { Policy } from '../utils/priority'
import { PriorityBadge, StatusBadge } from './Badges'

interface Props {
  policies:       Policy[]
  onSelectPolicy: (p: Policy) => void
  onRenew:        (p: Policy) => void
  onContact:      (p: Policy) => void
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(iso + 'T00:00:00')
  return Math.round((exp.getTime() - today.getTime()) / 86400000)
}

function DaysChip({ days }: { days: number }) {
  if (days > 0) {
    const color = days <= 7 ? 'text-orange-600' : days <= 15 ? 'text-amber-600' : 'text-stone-400'
    return <span className={`text-xs ${color}`}>en {days}d</span>
  }
  if (days >= -30) return <span className="text-xs text-red-500">hace {Math.abs(days)}d</span>
  return <span className="text-xs text-stone-400">+30d</span>
}

export default function PolicyTable({ policies, onSelectPolicy, onRenew, onContact }: Props) {
  if (policies.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-16 text-center">
        <p className="text-stone-400 text-sm">No se encontraron pólizas con esos filtros.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Cliente</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Póliza</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Vencimiento</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Prioridad</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {policies.map(p => {
              const days = daysUntil(p.expiration_date)
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPolicy(p)}
                  className="hover:bg-stone-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{p.client_name}</p>
                    {p.client_phone && (
                      <p className="text-xs text-stone-400">{p.client_phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-700">{p.policy_type}</p>
                    <p className="text-xs text-stone-400">{p.insurer}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-700">{formatDate(p.expiration_date)}</p>
                    <DaysChip days={days} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge level={p.priority_level} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {p.is_renewable && (
                        <button
                          onClick={() => onRenew(p)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Renovar
                        </button>
                      )}
                      <button
                        onClick={() => onContact(p)}
                        className="flex items-center gap-1 text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 px-2 py-1 rounded-md transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Contactar
                      </button>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-stone-100">
        {policies.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectPolicy(p)}
            className="px-4 py-4 hover:bg-stone-50 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-stone-800 text-sm">{p.client_name}</p>
                <p className="text-xs text-stone-400">{p.policy_type} · {p.insurer}</p>
              </div>
              <PriorityBadge level={p.priority_level} />
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-stone-400">{formatDate(p.expiration_date)}</span>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {p.is_renewable && (
                  <button onClick={() => onRenew(p)} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    Renovar
                  </button>
                )}
                <button onClick={() => onContact(p)} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
