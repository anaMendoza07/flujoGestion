import type { PriorityLevel, PolicyStatus } from '../utils/priority'
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/priority'

// ── Priority Badge ────────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  low:      'bg-stone-100 text-stone-600',
  medium:   'bg-blue-50  text-blue-700',
  high:     'bg-orange-50 text-orange-700',
  critical: 'bg-red-50   text-red-700 font-semibold',
  lost:     'bg-stone-200 text-stone-500',
}

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${PRIORITY_STYLES[level]}`}>
      {level === 'critical' && <span className="mr-1">⚠</span>}
      {PRIORITY_LABELS[level]}
    </span>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<PolicyStatus, string> = {
  active:   'bg-emerald-50 text-emerald-700',
  upcoming: 'bg-amber-50   text-amber-700',
  expired:  'bg-red-50     text-red-600',
  renewed:  'bg-blue-50    text-blue-700',
  lost:     'bg-stone-200  text-stone-500',
}

export function StatusBadge({ status }: { status: PolicyStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
