import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Trash2, RefreshCw, FileText, CalendarDays, Building2, User } from 'lucide-react'
import type { Policy, Client } from '../utils/priority'
import { STATUS_LABELS, PRIORITY_LABELS } from '../utils/priority'
import {
  getPolicies,
  getClients,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../services/api'

interface Props {
  onClose: () => void
  onRefresh?: () => void
}

const POLICY_TYPES = ['auto', 'vida', 'hogar', 'salud', 'soat', 'pyme', 'viaje', 'accidentes', 'otro']
const INSURERS     = ['Sura', 'Bolívar', 'Mapfre', 'Allianz', 'Axa', 'HDI', 'MetLife', 'Suramericana', 'Compensar', 'Coomeva', 'Colmédica', 'Nueva EPS', 'Assist Card', 'Otro']

const EMPTY_FORM = {
  client_id:       '' as number | '',
  policy_type:     'auto',
  insurer:         'Sura',
  expiration_date: '',
  premium_amount:  '',
}

type FormState = typeof EMPTY_FORM

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high:     'text-orange-600 bg-orange-50 border-orange-200',
  medium:   'text-amber-600 bg-amber-50 border-amber-200',
  low:      'text-emerald-600 bg-emerald-50 border-emerald-200',
  lost:     'text-stone-500 bg-stone-100 border-stone-200',
}

const fmt = (amount: number | null) =>
  amount != null
    ? `$${amount.toLocaleString('es-CO')}`
    : '—'

export default function PoliciesModal({ onClose, onRefresh }: Props) {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [clients, setClients]   = useState<Client[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [formError, setFormError] = useState('')
  const [editing, setEditing]   = useState<Policy | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm]         = useState<FormState>(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<Policy | null>(null)
  const [searchQ, setSearchQ]   = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [pRes, cRes] = await Promise.all([getPolicies(), getClients()])
      setPolicies(pRes.data)
      setClients(cRes.data)
    } catch {
      setError('No se pudo cargar la información.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 365)
    setForm({ ...EMPTY_FORM, expiration_date: tomorrow.toISOString().split('T')[0] })
    setFormError('')
    setCreating(true)
  }

  const openEdit = (p: Policy) => {
    setCreating(false)
    setForm({
      client_id:       p.client_id,
      policy_type:     p.policy_type,
      insurer:         p.insurer,
      expiration_date: p.expiration_date,
      premium_amount:  p.premium_amount != null ? String(p.premium_amount) : '',
    })
    setFormError('')
    setEditing(p)
  }

  const cancelForm = () => {
    setCreating(false)
    setEditing(null)
    setFormError('')
  }

  const handleSave = async () => {
    if (!form.client_id) { setFormError('Selecciona un cliente.'); return }
    if (!form.expiration_date) { setFormError('La fecha de vencimiento es requerida.'); return }
    setSaving(true)
    setFormError('')
    const payload = {
      client_id:       Number(form.client_id),
      policy_type:     form.policy_type,
      insurer:         form.insurer,
      expiration_date: form.expiration_date,
      premium_amount:  form.premium_amount ? Number(form.premium_amount) : null,
    }
    try {
      if (editing) {
        await updatePolicy(editing.id, payload)
      } else {
        await createPolicy(payload)
      }
      await load()
      onRefresh?.()
      cancelForm()
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Error al guardar la póliza.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Policy) => {
    setSaving(true)
    try {
      await deletePolicy(p.id)
      await load()
      onRefresh?.()
      setConfirmDelete(null)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al eliminar la póliza.')
    } finally {
      setSaving(false)
    }
  }

  const inForm = creating || !!editing

  const filtered = policies.filter(p => {
    if (!searchQ) return true
    const q = searchQ.toLowerCase()
    return p.client_name?.toLowerCase().includes(q) ||
           p.insurer?.toLowerCase().includes(q) ||
           p.policy_type?.toLowerCase().includes(q)
  })

  const dateLabel = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-800">Pólizas</h2>
              <p className="text-xs text-stone-400 mt-0.5">{policies.length} registradas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!inForm && (
              <>
                <input
                  type="text"
                  placeholder="Buscar…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  className="text-xs border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-stone-50 w-36"
                />
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva póliza
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form panel */}
        {inForm && (
          <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 flex-shrink-0">
            <p className="text-xs font-semibold text-stone-600 mb-3 uppercase tracking-wider">
              {editing ? 'Editar póliza' : 'Nueva póliza'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Cliente */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-stone-600 mb-1">Cliente *</label>
                <select
                  value={form.client_id}
                  onChange={e => setForm({ ...form, client_id: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                >
                  <option value="">Seleccionar cliente…</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Tipo de póliza</label>
                <select
                  value={form.policy_type}
                  onChange={e => setForm({ ...form, policy_type: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white capitalize"
                >
                  {POLICY_TYPES.map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              {/* Aseguradora */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Aseguradora</label>
                <select
                  value={form.insurer}
                  onChange={e => setForm({ ...form, insurer: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                >
                  {INSURERS.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              {/* Vencimiento */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Fecha de vencimiento *</label>
                <input
                  type="date"
                  value={form.expiration_date}
                  onChange={e => setForm({ ...form, expiration_date: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                />
              </div>
              {/* Prima */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Prima (COP)</label>
                <input
                  type="number"
                  placeholder="Ej. 850000"
                  value={form.premium_amount}
                  onChange={e => setForm({ ...form, premium_amount: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                />
              </div>
            </div>
            {formError && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={cancelForm}
                className="text-xs text-stone-600 hover:text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {editing ? 'Guardar cambios' : 'Crear póliza'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-shrink-0">{error}</div>
        )}

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 animate-spin text-stone-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-stone-400">
              {searchQ ? 'Sin resultados para esa búsqueda.' : 'No hay pólizas aún.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 sticky top-0">
                <tr className="text-left text-xs text-stone-500">
                  <th className="px-4 py-2 font-medium">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Cliente</span>
                  </th>
                  <th className="px-4 py-2 font-medium">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Tipo</span>
                  </th>
                  <th className="px-4 py-2 font-medium">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Aseguradora</span>
                  </th>
                  <th className="px-4 py-2 font-medium">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Vencimiento</span>
                  </th>
                  <th className="px-4 py-2 font-medium text-right">Prima</th>
                  <th className="px-4 py-2 font-medium text-center">Estado</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-stone-800">{p.client_name}</td>
                    <td className="px-4 py-2.5 text-stone-600 capitalize">{p.policy_type}</td>
                    <td className="px-4 py-2.5 text-stone-600">{p.insurer}</td>
                    <td className="px-4 py-2.5 text-stone-600">{dateLabel(p.expiration_date)}</td>
                    <td className="px-4 py-2.5 text-stone-600 text-right tabular-nums">{fmt(p.premium_amount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[p.priority_level]}`}>
                        {PRIORITY_LABELS[p.priority_level]}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-stone-800">¿Eliminar póliza?</h3>
              <p className="text-sm text-stone-500 mt-1">
                Póliza de <strong>{confirmDelete.client_name}</strong> en {confirmDelete.insurer} ({confirmDelete.policy_type}).
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 text-sm text-stone-600 hover:text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
