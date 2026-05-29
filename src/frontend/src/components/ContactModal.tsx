import { useState } from 'react'
import { X, Send } from 'lucide-react'
import type { Policy, ActivityType } from '../utils/priority'
import { ACTIVITY_LABELS } from '../utils/priority'
import { createActivity } from '../services/api'

interface Props {
  policy:    Policy
  onClose:   () => void
  onSuccess: () => void
}

const ACTIVITY_TYPES: ActivityType[] = ['contact', 'note', 'reminder', 'other']

export default function ContactModal({ policy, onClose, onSuccess }: Props) {
  const [type, setType]       = useState<ActivityType>('contact')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await createActivity(policy.id, { activity_type: type, note: note.trim() || undefined })
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al registrar la actividad.')
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
            <h2 className="font-semibold text-stone-800">Registrar actividad</h2>
            <p className="text-xs text-stone-400 mt-0.5">{policy.client_name} · {policy.insurer}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-2">Tipo de actividad</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-sm px-3 py-2 rounded-lg border transition-colors text-left ${
                    type === t
                      ? 'border-stone-700 bg-stone-800 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {ACTIVITY_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Nota <span className="text-stone-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Describe el contacto o la acción realizada…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50 resize-none placeholder:text-stone-400"
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
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-stone-800 text-white hover:bg-stone-900 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
            Registrar
          </button>
        </div>
      </div>
    </div>
  )
}
