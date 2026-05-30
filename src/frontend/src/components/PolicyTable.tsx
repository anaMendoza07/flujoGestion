import { useState } from 'react'
import { RefreshCw, FileText, ArrowUpDown, MessageCircle } from 'lucide-react'
import type { Policy } from '../utils/priority'
import { PriorityBadge, StatusBadge } from './Badges'

interface Props {
  policies: Policy[]
  onSelectPolicy: (p: Policy) => void
  onRenew: (p: Policy) => void
  onContact: (p: Policy) => void
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(iso + 'T00:00:00')
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
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedPolicies = [...policies].sort((a: any, b: any) => {
    if (!sortField) return 0
    const aVal = a[sortField], bVal = b[sortField]
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (policies.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-16 text-center">
        <p className="text-stone-400 text-sm">No se encontraron pólizas con esos filtros.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">

      {/* DESKTOP */}
      <div className="hidden sm:block">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[22%]" />   {/* Cliente */}
            <col className="w-[14%]" />   {/* Póliza */}
            <col className="w-[16%]" />   {/* Vencimiento */}
            <col className="w-[12%]" />   {/* Estado */}
            <col className="w-[12%]" />   {/* Prioridad */}
            <col className="w-[24%]" />   {/* Acciones */}
          </colgroup>

          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-left">
              <th
                onClick={() => handleSort('client_name')}
                className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide cursor-pointer hover:bg-stone-100"
              >
                <div className="flex items-center gap-2">Cliente <ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
              </th>
              <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Póliza</th>
              <th
                onClick={() => handleSort('expiration_date')}
                className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide cursor-pointer hover:bg-stone-100"
              >
                <div className="flex items-center gap-2">Vencimiento <ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide cursor-pointer hover:bg-stone-100"
              >
                <div className="flex items-center gap-2">Estado <ArrowUpDown className="w-3 h-3 text-stone-400" /></div>
              </th>
              <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Prioridad</th>
              <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {sortedPolicies.map(p => {
              const days = daysUntil(p.expiration_date)
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPolicy(p)}
                  className="hover:bg-stone-50 cursor-pointer group"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-stone-800">{p.client_name}</p>
                    {p.client_phone && <p className="text-xs text-stone-400">{p.client_phone}</p>}
                  </td>

                  <td className="px-5 py-3">
                    <p className="text-stone-700 capitalize">{p.policy_type}</p>
                    <p className="text-xs text-stone-400">{p.insurer}</p>
                  </td>

                  <td className="px-5 py-3">
                    <p className="text-stone-700">{formatDate(p.expiration_date)}</p>
                    <DaysChip days={days} />
                  </td>

                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="px-5 py-3">
                    <PriorityBadge level={p.priority_level} />
                  </td>

                  <td className="px-5 py-3">
                    <div
                      className="flex items-center gap-2"
                      onClick={e => e.stopPropagation()}
                    >
                      {p.is_renewable && (
                        <button
                          onClick={() => onRenew(p)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1.5 rounded-lg whitespace-nowrap"
                        >
                          <RefreshCw className="w-3 h-3" /> Renovar
                        </button>
                      )}

                      <button
                        onClick={() => onContact(p)}
                        className="flex items-center gap-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-xl whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" /> Registrar actividad
                      </button>

                      <button
                        onClick={() => window.open(`https://wa.me/${p.client_phone}`, '_blank')}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 flex-shrink-0"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      {/* ← ChevronRight eliminado */}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden divide-y divide-stone-100">
        {sortedPolicies.map(p => (
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-stone-400">{formatDate(p.expiration_date)}</span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                {p.is_renewable && (
                  <button onClick={() => onRenew(p)} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    Renovar
                  </button>
                )}
                <button onClick={() => onContact(p)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                  Registrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
