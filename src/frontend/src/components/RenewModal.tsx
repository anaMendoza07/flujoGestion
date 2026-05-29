import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import type { Policy } from '../utils/priority'
import { renewPolicy } from '../services/api'

interface Props {
  policy:    Policy
  onClose:   () => void
  onSuccess: (updated: Policy) => void
}

export default function RenewModal({ policy, onClose, onSuccess }: Props) {
  const [date, setDate]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Fecha mínima: mañana
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!date) { setError('Selecciona una nueva fecha de vencimiento.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await renewPolicy(policy.id, date)
      onSuccess(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al renovar la póliza.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-800">Renovar póliza</h2>
            <p className="text-xs text-stone-400 mt-0.5">{policy.client_name} · {policy.insurer}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
            Vencimiento actual: <strong>{new Date(policy.expiration_date + 'T00:00:00').toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' })}</strong>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Nueva fecha de vencimiento
            </label>
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-stone-600 hover:text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !date}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Confirmar renovación
          </button>
        </div>
      </div>
    </div>
  )
}
