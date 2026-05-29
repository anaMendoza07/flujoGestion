import { Search, X } from 'lucide-react'

export interface Filters {
  search:   string
  status:   string
  priority: string
  insurer:  string
}

interface Props {
  filters:       Filters
  onChange:      (f: Filters) => void
  onClear:       () => void
  totalCount:    number
  filteredCount: number
}

const STATUS_OPTIONS = [
  { value: '',         label: 'Todos los estados' },
  { value: 'active',   label: 'Activa' },
  { value: 'upcoming', label: 'Por vencer' },
  { value: 'expired',  label: 'Vencida' },
  { value: 'renewed',  label: 'Renovada' },
  { value: 'lost',     label: 'Perdida' },
]

const PRIORITY_OPTIONS = [
  { value: '',         label: 'Todas las prioridades' },
  { value: 'critical', label: 'Crítica' },
  { value: 'high',     label: 'Urgente' },
  { value: 'medium',   label: 'Medio' },
  { value: 'low',      label: 'Bajo' },
  { value: 'lost',     label: 'Perdida' },
]

export default function FilterBar({ filters, onChange, onClear, totalCount, filteredCount }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar cliente o aseguradora…"
            value={filters.search}
            onChange={set('search')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-400"
          />
        </div>

        {/* Estado */}
        <select
          value={filters.status}
          onChange={set('status')}
          className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 text-stone-700"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Prioridad */}
        <select
          value={filters.priority}
          onChange={set('priority')}
          className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 text-stone-700"
        >
          {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Limpiar */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* Contador */}
      {hasFilters && (
        <p className="text-xs text-stone-400">
          Mostrando <span className="font-medium text-stone-600">{filteredCount}</span> de {totalCount} pólizas
        </p>
      )}
    </div>
  )
}
