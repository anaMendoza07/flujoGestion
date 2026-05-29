import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Trash2, RefreshCw, UserPlus, Users, Phone, Mail } from 'lucide-react'
import type { Client } from '../utils/priority'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '../services/api'

interface Props {
  onClose: () => void
}

const EMPTY_FORM = { full_name: '', phone: '', email: '' }

export default function ClientsModal({ onClose }: Props) {
  const [clients, setClients]   = useState<Client[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [formError, setFormError] = useState('')
  const [editing, setEditing]   = useState<Client | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getClients()
      setClients(res.data)
    } catch {
      setError('No se pudo cargar la lista de clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setCreating(true)
  }

  const openEdit = (c: Client) => {
    setCreating(false)
    setForm({ full_name: c.full_name, phone: c.phone ?? '', email: c.email ?? '' })
    setFormError('')
    setEditing(c)
  }

  const cancelForm = () => {
    setCreating(false)
    setEditing(null)
    setFormError('')
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setFormError('El nombre completo es requerido.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateClient(editing.id, { full_name: form.full_name, phone: form.phone || undefined, email: form.email || undefined })
      } else {
        await createClient({ full_name: form.full_name, phone: form.phone || undefined, email: form.email || undefined })
      }
      await load()
      cancelForm()
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Error al guardar el cliente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: Client) => {
    setSaving(true)
    try {
      await deleteClient(c.id)
      await load()
      setConfirmDelete(null)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al eliminar el cliente.')
    } finally {
      setSaving(false)
    }
  }

  const inForm = creating || !!editing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-800">Clientes</h2>
              <p className="text-xs text-stone-400 mt-0.5">{clients.length} registrados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!inForm && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Nuevo cliente
              </button>
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
              {editing ? 'Editar cliente' : 'Nuevo cliente'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  placeholder="Ej. María García"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="3001234567"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
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
                className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {editing ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </div>
        )}

        {/* Error global */}
        {error && (
          <div className="mx-5 mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-shrink-0">
            {error}
          </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 animate-spin text-stone-300" />
            </div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center text-sm text-stone-400">
              No hay clientes aún. Crea el primero.
            </div>
          ) : (
            clients.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">
                      {c.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{c.full_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.phone && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="text-xs text-stone-400 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" /> {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-stone-400 hover:text-indigo-600 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(c)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-stone-800">¿Eliminar cliente?</h3>
              <p className="text-sm text-stone-500 mt-1">
                Se eliminará <strong>{confirmDelete.full_name}</strong> y todas sus pólizas asociadas. Esta acción no se puede deshacer.
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
