// Tipos alineados al backend (priority_service.py + models)
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical' | 'lost'
export type PolicyStatus  = 'active' | 'upcoming' | 'expired' | 'renewed' | 'lost'
export type ActivityType  = 'contact' | 'note' | 'renewal' | 'reminder' | 'other'

export interface Policy {
  id:              number
  client_id:       number
  client_name:     string
  client_phone:    string | null
  policy_type:     string
  insurer:         string
  expiration_date: string
  status:          PolicyStatus
  priority_level:  PriorityLevel
  is_renewable:    boolean
  premium_amount:  number | null
  created_at:      string
}

export interface Client {
  id:         number
  full_name:  string
  phone:      string | null
  email:      string | null
  created_at: string
}

export interface Activity {
  id:            number
  policy_id:     number
  activity_type: ActivityType
  note:          string | null
  created_at:    string
}

// Orden de prioridad para ordenar la tabla (más urgente primero)
const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  critical: 0,
  high:     1,
  medium:   2,
  low:      3,
  lost:     4,
}

export function sortByPriority(policies: Policy[]): Policy[] {
  return [...policies].sort(
    (a, b) => PRIORITY_ORDER[a.priority_level] - PRIORITY_ORDER[b.priority_level]
  )
}

// Etiquetas legibles en español
export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low:      'Bajo',
  medium:   'Medio',
  high:     'Urgente',
  critical: 'Crítico',
  lost:     'Perdida',
}

export const STATUS_LABELS: Record<PolicyStatus, string> = {
  active:   'Activa',
  upcoming: 'Por vencer',
  expired:  'Vencida',
  renewed:  'Renovada',
  lost:     'Perdida',
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  contact:  'Contacto',
  note:     'Nota',
  renewal:  'Renovación',
  reminder: 'Recordatorio',
  other:    'Otro',
}
