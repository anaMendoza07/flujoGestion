
import type { Policy } from '../utils/priority'

interface Props {
  policies: Policy[]

  activeMetric: string

  onSelectMetric: (
    metric: string
  ) => void
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
  value: number
  label: string
  subtitle: string
  gradient: string
  shadow: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group
        flex
        items-center
        gap-4
        min-w-[240px]
        transition-all
        duration-300
        text-left
        ${
          active
            ? 'scale-105'
            : 'opacity-90 hover:opacity-100'
        }
      `}
    >

      {/* círculo */}
      <div
        className={`
          relative
          w-20
          h-20
          rounded-full
          p-[6px]
          ${gradient}
          ${shadow}
          transition-all
          duration-300
          group-hover:scale-105
          flex-shrink-0
          ${
            active
              ? 'ring-4 ring-stone-200'
              : ''
          }
        `}
      >
        {/* interior */}
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">

          <span className="text-xl font-black text-stone-800 leading-none">
            {value}
          </span>

          <span className="text-[8px] uppercase tracking-wider text-stone-400 mt-1">
            pólizas
          </span>
        </div>

        {/* brillo */}
        <div className="absolute top-2 left-3 w-6 h-1.5 bg-white/40 rounded-full blur-sm"></div>
      </div>

      {/* textos */}
      <div>

        <p className="text-sm font-bold text-stone-800">
          {label}
        </p>

        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          {subtitle}
        </p>

      </div>
    </button>
  )
}

export default function StatsBar({
  policies,
  activeMetric,
  onSelectMetric,
}: Props) {

  const critical = policies.filter(
    p => p.priority_level === 'critical'
  ).length

  const high = policies.filter(
    p => p.priority_level === 'high'
  ).length

  const renewable = policies.filter(
    p => p.is_renewable
  ).length

  return (
    <div className="bg-white border border-stone-200 rounded-3xl px-8 py-6 shadow-sm">

      {/* métricas */}
      <div className="flex flex-wrap items-center gap-12">

        <CircleCard
          value={critical}
          label="Críticas"
          subtitle="En ventana de 30 días"
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          shadow="shadow-[0_6px_18px_rgba(220,38,38,0.25)]"
          active={
            activeMetric === 'critical'
          }
          onClick={() =>
            onSelectMetric('critical')
          }
        />

        <CircleCard
          value={high}
          label="Urgentes"
          subtitle="Vencen esta semana"
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          shadow="shadow-[0_6px_18px_rgba(249,115,22,0.25)]"
          active={
            activeMetric === 'high'
          }
          onClick={() =>
            onSelectMetric('high')
          }
        />

        <CircleCard
          value={renewable}
          label="Renovables"
          subtitle="Vencen en 15 días"
          gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
          shadow="shadow-[0_6px_18px_rgba(234,179,8,0.25)]"
          active={
            activeMetric === 'renewable'
          }
          onClick={() =>
            onSelectMetric('renewable')
          }
        />
      </div>
    </div>
  )
}
