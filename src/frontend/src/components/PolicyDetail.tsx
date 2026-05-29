import { useState, useEffect } from 'react'
import { X, Phone, RefreshCw, Clock, FileText } from 'lucide-react'
import type { Policy, Activity } from '../utils/priority'
import { ACTIVITY_LABELS } from '../utils/priority'
import { getActivities } from '../services/api'
import { PriorityBadge, StatusBadge } from './Badges'

interface Props {
  policy:    Policy
  onClose:   () => void
  onRenew:   (p: Policy) => void
  onContact: (p: Policy) => void
  onRefresh: () => void
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ACTIVITY_ICON: Record<string, string> = {
  contact:  '📞',
  note:     '📝',
  renewal:  '🔄',
  reminder: '🔔',
  other:    '•',
}

export default function PolicyDetail({ policy, onClose, onRenew, onContact }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    getActivities(policy.id)
      .then(r => setActivities(r.data))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [policy.id])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-800">{policy.client_name}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{policy.policy_type} · {policy.insurer}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {/* Info general */}
          <div className="px-5 py-4 space-y-3 border-b border-stone-100">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={policy.status} />
              <PriorityBadge level={policy.priority_level} />
              {policy.is_renewable && (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-md">
                  Renovable
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-stone-400">Vencimiento</p>
                <p className="text-stone-700 font-medium">{formatDate(policy.expiration_date)}</p>
              </div>
              {policy.premium_amount != null && (
                <div>
                  <p className="text-xs text-stone-400">Prima</p>
                  <p className="text-stone-700 font-medium">
                    ${policy.premium_amount.toLocaleString('es-CO')}
                  </p>
                </div>
              )}
              {policy.client_phone && (
                <div>
                  <p className="text-xs text-stone-400">Teléfono</p>
                  <p className="text-stone-700">{policy.client_phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-400">ID Póliza</p>
                <p className="text-stone-500 font-mono text-xs">#{policy.id}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-5 py-4 border-b border-stone-100 flex gap-2">
            {policy.is_renewable && (
              <button
                onClick={() => onRenew(policy)}
                className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Renovar póliza
              </button>
            )}
            <button
              onClick={() => onContact(policy)}
              className="flex items-center gap-1.5 text-sm bg-stone-100 text-stone-700 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
            >
              <Phone className="w-4 h-4" /> Registrar contacto
            </button>
          </div>

          {/* Actividades */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Historial de actividades
            </h3>

            {loading ? (
              <p className="text-xs text-stone-400">Cargando…</p>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                <p className="text-xs text-stone-400">Sin actividades registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(a => (
                  <div key={a.id} className="flex gap-3">
                    <span className="text-base mt-0.5 shrink-0">{ACTIVITY_ICON[a.activity_type] ?? '•'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700">
                        {ACTIVITY_LABELS[a.activity_type]}
                      </p>
                      {a.note && (
                        <p className="text-xs text-stone-500 mt-0.5 break-words">{a.note}</p>
                      )}
                      <p className="text-[10px] text-stone-300 mt-1">{formatDateTime(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
