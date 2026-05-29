import { useState, useEffect, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { getPolicies } from '../services/api'
import { sortByPriority, type Policy } from '../utils/priority'
import StatsBar from '../components/StatsBar'
import FilterBar, { type Filters } from '../components/FilterBar'
import PolicyTable from '../components/PolicyTable.tsx'
import PolicyDetail from '../components/PolicyDetail'
import RenewModal from '../components/RenewModal'
import ContactModal from '../components/ContactModal'

const EMPTY_FILTERS: Filters = { search: '', status: '', priority: '', insurer: '' }

export default function Dashboard() {
  const [policies, setPolicies]               = useState<Policy[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')
  const [filters, setFilters]                 = useState<Filters>(EMPTY_FILTERS)
  const [selectedPolicy, setSelectedPolicy]   = useState<Policy | null>(null)
  const [renewPolicy, setRenewPolicy]         = useState<Policy | null>(null)
  const [contactPolicy, setContactPolicy]     = useState<Policy | null>(null)

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
      return true
    })
  }, [policies, filters])

  const handleRenewSuccess = (updatedPolicy: Policy) => {
    setPolicies((prev) =>
      sortByPriority(prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p)))
    )
    setRenewPolicy(null)
    if (selectedPolicy?.id === updatedPolicy.id) setSelectedPolicy(updatedPolicy)
  }

  const handleContactSuccess = () => {
    setContactPolicy(null)
    if (selectedPolicy?.id === contactPolicy?.id) setSelectedPolicy({ ...selectedPolicy! })
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-stone-800 tracking-tight">Agentemotor</h1>
            <p className="text-xs text-stone-400">Gestión de pólizas · María</p>
          </div>
          <button
            onClick={fetchPolicies}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 disabled:opacity-40 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && <StatsBar policies={policies} />}

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
          totalCount={policies.length}
          filteredCount={filteredPolicies.length}
        />

        {loading ? (
          <div className="bg-white border border-stone-200 rounded-xl p-16 text-center">
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

      {selectedPolicy && (
        <PolicyDetail
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          onRenew={setRenewPolicy}
          onContact={setContactPolicy}
          onRefresh={fetchPolicies}
        />
      )}

      {renewPolicy && (
        <RenewModal
          policy={renewPolicy}
          onClose={() => setRenewPolicy(null)}
          onSuccess={handleRenewSuccess}
        />
      )}

      {contactPolicy && (
        <ContactModal
          policy={contactPolicy}
          onClose={() => setContactPolicy(null)}
          onSuccess={handleContactSuccess}
        />
      )}
    </div>
  )
}
