import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import type { Policy } from '../utils/priority'

interface Props {
  policies:        Policy[]
  activeMetric:    string
  onSelectMetric:  (metric: string) => void
}

function CircleCard({
  value,
  label,
  subtitle,
  gradient,
  shadow,
  active,
  onClick,
}: {
  value:    number
  label:    string
  subtitle: string
  gradient: string
  shadow:   string
  active:   boolean
  onClick:  () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group
        flex
        items-center
        gap-4
        min-w-[220px]
        transition-all
        duration-300
        text-left
        ${active ? 'scale-105' : 'opacity-90 hover:opacity-100'}
      `}
    >
      {/* círculo */}
      <div
        className={`
          relative w-20 h-20 rounded-full p-[6px]
          ${gradient} ${shadow}
          transition-all duration-300 group-hover:scale-105 flex-shrink-0
          ${active ? 'ring-4 ring-stone-200' : ''}
        `}
      >
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-xl font-black text-stone-800 leading-none">{value}</span>
          <span className="text-[8px] uppercase tracking-wider text-stone-400 mt-1">pólizas</span>
        </div>
        <div className="absolute top-2 left-3 w-6 h-1.5 bg-white/40 rounded-full blur-sm"></div>
      </div>

      {/* textos */}
      <div>
        <p className="text-sm font-bold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{subtitle}</p>
      </div>
    </button>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('es-CO', {
    month: 'long',
    year:  'numeric',
  })
}

function renewedPremiumsForMonth(policies: Policy[], year: number, month: number): number {
  return policies
    .filter(p => {
      if (p.status !== 'renewed') return false
      const d = new Date(p.expiration_date + 'T00:00:00')
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    .reduce((sum, p) => sum + (p.premium_amount ?? 0), 0)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StatsBar({ policies, activeMetric, onSelectMetric }: Props) {
  const now = new Date()
  const [selYear, setSelYear]   = useState(now.getFullYear())
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1)

  const critical  = policies.filter(p => p.priority_level === 'critical').length
  const high      = policies.filter(p => p.priority_level === 'high').length
  const renewable = policies.filter(p => p.is_renewable).length

  const totalRenewedPremiums = renewedPremiumsForMonth(policies, selYear, selMonth)

  const prevMonth = () => {
    if (selMonth === 1) { setSelYear(y => y - 1); setSelMonth(12) }
    else setSelMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (selMonth === 12) { setSelYear(y => y + 1); setSelMonth(1) }
    else setSelMonth(m => m + 1)
  }

  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth() + 1

  return (
    <div className="bg-white border border-stone-200 rounded-3xl px-8 py-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-8 xl:gap-12">

        {/* Métricas de prioridad */}
        <CircleCard
          value={critical}
          label="Críticas"
          subtitle="En ventana de 30 días"
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          shadow="shadow-[0_6px_18px_rgba(220,38,38,0.25)]"
          active={activeMetric === 'critical'}
          onClick={() => onSelectMetric('critical')}
        />

        <CircleCard
          value={high}
          label="Urgentes"
          subtitle="Vencen esta semana"
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          shadow="shadow-[0_6px_18px_rgba(249,115,22,0.25)]"
          active={activeMetric === 'high'}
          onClick={() => onSelectMetric('high')}
        />

        <CircleCard
          value={renewable}
          label="Renovables"
          subtitle="Vencen en 15 días"
          gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
          shadow="shadow-[0_6px_18px_rgba(234,179,8,0.25)]"
          active={activeMetric === 'renewable'}
          onClick={() => onSelectMetric('renewable')}
        />

        {/* Separador vertical */}
        <div className="hidden xl:block w-px h-16 bg-stone-100" />

        {/* Primas renovadas del mes */}
        <div className="flex items-center gap-4 min-w-[240px]">
          {/* ícono */}
          <div className="relative w-20 h-20 rounded-full p-[6px] bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_6px_18px_rgba(124,58,237,0.25)] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center px-1">
              <TrendingUp className="w-5 h-5 text-violet-600 mb-0.5" />
              <span className="text-[7px] uppercase tracking-wider text-stone-400 text-center leading-tight">primas</span>
            </div>
            <div className="absolute top-2 left-3 w-6 h-1.5 bg-white/40 rounded-full blur-sm"></div>
          </div>

          {/* texto + nav de mes */}
          <div>
            <p className="text-sm font-bold text-stone-800">Primas renovadas</p>

            {/* selector de mes */}
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={prevMonth}
                className="p-0.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className={`text-xs font-medium capitalize ${isCurrentMonth ? 'text-violet-600' : 'text-stone-600'}`}>
                {getMonthLabel(selYear, selMonth)}
              </span>
              <button
                onClick={nextMonth}
                className="p-0.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* total */}
            <p className="text-base font-black text-stone-800 mt-1 tabular-nums">
              {totalRenewedPremiums > 0
                ? `$${totalRenewedPremiums.toLocaleString('es-CO')}`
                : <span className="text-sm font-normal text-stone-400">Sin renovaciones</span>
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
