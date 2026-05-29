
import type { Policy } from '../utils/priority'

interface Props {
  policies: Policy[]
}

function CircleCard({
  value,
  label,
  subtitle,
  gradient,
  shadow,
}: {
  value: number
  label: string
  subtitle: string
  gradient: string
  shadow: string
}) {
  return (
    <div className="group flex items-center gap-4 min-w-[240px]">

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
    </div>
  )
}

export default function StatsBar({
  policies,
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

      <div className="flex flex-wrap items-center justify-between gap-8">

        {/* métricas horizontales */}
        <div className="flex flex-wrap items-center gap-10">

          <CircleCard
            value={critical}
            label="Críticas"
            subtitle="En ventana de 30 días"
            gradient="bg-gradient-to-br from-red-500 to-red-700"
            shadow="shadow-[0_6px_18px_rgba(220,38,38,0.25)]"
          />

          <CircleCard
            value={high}
            label="Urgentes"
            subtitle="Vencen esta semana"
            gradient="bg-gradient-to-br from-orange-400 to-orange-600"
            shadow="shadow-[0_6px_18px_rgba(249,115,22,0.25)]"
          />

          <CircleCard
            value={renewable}
            label="Renovables"
            subtitle="Vencen en 15 días"
            gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
            shadow="shadow-[0_6px_18px_rgba(234,179,8,0.25)]"
          />
        </div>

        {/* card primas */}
        <div
          className="
            min-w-[250px]
            bg-gradient-to-br
            from-emerald-500
            to-emerald-700
            text-white
            rounded-3xl
            px-7
            py-6
            shadow-[0_8px_25px_rgba(16,185,129,0.25)]
          "
        >
          <p className="text-xs uppercase tracking-wide opacity-80">
            Primas renovadas
          </p>

          <h2 className="text-4xl font-black mt-2 leading-none">
            $12.8M
          </h2>

          <p className="text-xs opacity-80 mt-3">
            renovadas este mes
          </p>
        </div>
      </div>
    </div>
  )
}
