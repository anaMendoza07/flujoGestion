
import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Users, FileText } from 'lucide-react'

import { getPolicies } from '../services/api.js'
import { sortByPriority, type Policy } from '../utils/priority.js'

import StatsBar    from '../components/StatsBar.tsx'
import FilterBar, { type Filters } from '../components/FilterBar'
import PolicyTable from '../components/PolicyTable'
import PolicyDetail from '../components/PolicyDetail'
import RenewModal  from '../components/RenewModal'
import ContactModal from '../components/ContactModal'
import ClientsModal from '../components/ClientsModal'
import PoliciesModal from '../components/PoliciesModal.tsx'


const EMPTY_FILTERS: Filters = {
  search:    '',
  status:    '',
  priority:  '',
  insurer:   '',
  startDate: '',
  endDate:   '',
}


export default function Dashboard() {

  const [policies, setPolicies]     = useState<Policy[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filters, setFilters]       = useState<Filters>(EMPTY_FILTERS)
  const [activeMetric, setActiveMetric] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [renewPolicy, setRenewPolicy]       = useState<Policy | null>(null)
  const [contactPolicy, setContactPolicy]   = useState<Policy | null>(null)

  // Modal CRUD
  const [showClients, setShowClients]   = useState(false)
  const [showPolicies, setShowPolicies] = useState(false)

  const fetchPolicies = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getPolicies()
      setPolicies(sortByPriority(res.data))
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPolicies() }, [])

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const search = filters.search.toLowerCase()
      if (search) {
        const inName    = p.client_name?.toLowerCase().includes(search)
        const inInsurer = p.insurer?.toLowerCase().includes(search)
        if (!inName && !inInsurer) return false
      }
      if (filters.status   && p.status         !== filters.status)   return false
      if (filters.priority && p.priority_level !== filters.priority) return false
      if (filters.insurer  && p.insurer?.toLowerCase() !== filters.insurer.toLowerCase()) return false
      if (filters.startDate) {
        if (new Date(p.expiration_date) < new Date(filters.startDate)) return false
      }
      if (filters.endDate) {
        if (new Date(p.expiration_date) > new Date(filters.endDate)) return false
      }
      return true
    })
  }, [policies, filters])

  const handleRenewSuccess = (updatedPolicy: Policy) => {
    setPolicies((prev) =>
      sortByPriority(prev.map((p) => p.id === updatedPolicy.id ? updatedPolicy : p))
    )
    setRenewPolicy(null)
    if (selectedPolicy?.id === updatedPolicy.id) setSelectedPolicy(updatedPolicy)
  }

  const handleContactSuccess = () => {
    setContactPolicy(null)
    if (selectedPolicy?.id === contactPolicy?.id) {
      setSelectedPolicy({ ...selectedPolicy! })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* izquierda — logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-200">
              M
            </div>
            <div>
              <h1 className="text-xl font-black text-stone-800 tracking-tight">AgenteMotor</h1>
              <p className="text-xs text-stone-500 mt-0.5">María · Gestión de pólizas</p>
            </div>
          </div>

          {/* derecha — acciones */}
          <div className="flex items-center gap-2">

            {/* Clientes CRUD */}
            <button
              onClick={() => setShowClients(true)}
              className="
                flex items-center gap-2
                px-3.5 py-2 rounded-xl
                bg-indigo-50 border border-indigo-200
                text-indigo-700 hover:bg-indigo-100
                text-xs font-semibold
                transition-all shadow-sm
              "
              title="Gestionar clientes"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </button>

            {/* Pólizas CRUD */}
            <button
              onClick={() => setShowPolicies(true)}
              className="
                flex items-center gap-2
                px-3.5 py-2 rounded-xl
                bg-emerald-50 border border-emerald-200
                text-emerald-700 hover:bg-emerald-100
                text-xs font-semibold
                transition-all shadow-sm
              "
              title="Gestionar pólizas"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Pólizas</span>
            </button>

            {/* Actualizar */}
            <button
              onClick={fetchPolicies}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-stone-700 disabled:opacity-40 transition-all shadow-sm"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {/* STATS */}
        {!loading && (
          <StatsBar
            policies={policies}
            activeMetric={activeMetric}
            onSelectMetric={(metric) => {
              if (activeMetric === metric) {
                setActiveMetric('')
                setFilters({ ...filters, priority: '', status: '' })
                return
              }
              setActiveMetric(metric)
              if (metric === 'critical') setFilters({ ...filters, priority: 'critical', status: '' })
              if (metric === 'high')     setFilters({ ...filters, priority: 'high',     status: '' })
              if (metric === 'renewable') setFilters({ ...filters, priority: '',        status: 'renewable' })
            }}
          />
        )}

        {/* FILTROS */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={() => { setFilters(EMPTY_FILTERS); setActiveMetric('') }}
          totalCount={policies.length}
          filteredCount={filteredPolicies.length}
        />

        {/* TABLA */}
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">Cargando pólizas…</p>
          </div>
        ) : (
          <PolicyTable
            policies={filteredPolicies}
            onSelectPolicy={setSelectedPolicy}
            onRenew={setRenewPolicy}
            onContact={setContactPolicy}
          />
        )}
      </main>

      {/* DETAIL */}
      {selectedPolicy && (
        <PolicyDetail
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          onRenew={setRenewPolicy}
          onContact={setContactPolicy}
          onRefresh={fetchPolicies}
        />
      )}

      {/* RENEW */}
      {renewPolicy && (
        <RenewModal
          policy={renewPolicy}
          onClose={() => setRenewPolicy(null)}
          onSuccess={handleRenewSuccess}
        />
      )}

      {/* CONTACT */}
      {contactPolicy && (
        <ContactModal
          policy={contactPolicy}
          onClose={() => setContactPolicy(null)}
          onSuccess={handleContactSuccess}
        />
      )}

      {/* CLIENTS CRUD */}
      {showClients && (
        <ClientsModal onClose={() => setShowClients(false)} />
      )}

      {/* POLICIES CRUD */}
      {showPolicies && (
        <PoliciesModal
          onClose={() => setShowPolicies(false)}
          onRefresh={fetchPolicies}
        />
      )}
    </div>
  )
}
