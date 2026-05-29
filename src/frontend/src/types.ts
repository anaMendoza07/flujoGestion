// ── Clientes ────────────────────────────────────────────────────────────────
export interface Client {
  id: number
  full_name: string
  phone: string | null
  email: string | null
  created_at: string
}

export interface ClientForm {
  full_name: string
  phone: string
  email: string
}

// ── Pólizas ─────────────────────────────────────────────────────────────────
export type PolicyStatus = 'active' | 'upcoming' | 'expired' | 'renewed' | 'lost'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical' | 'lost'
export type PolicyType = string
export type ActivityType = 'contact' | 'note' | 'renewal' | 'reminder' | 'other'

export interface Policy {
  id: number
  client_id: number
  client_name: string
  client_phone: string | null
  policy_type: string
  insurer: string
  expiration_date: string
  status: PolicyStatus
  priority_level: PriorityLevel
  is_renewable: boolean
  premium_amount: number | null
  created_at: string
}

export interface PolicyForm {
  client_id: number | ''
  policy_type: string
  insurer: string
  expiration_date: string
  premium_amount: string
}

// ── Actividades ──────────────────────────────────────────────────────────────
export interface Activity {
  id: number
  policy_id: number
  activity_type: ActivityType
  note: string | null
  created_at: string
}

export interface ActivityForm {
  activity_type: ActivityType
  note: string
}

// ── Reportes ─────────────────────────────────────────────────────────────────
export interface ReportSummary {
  critical: Policy[]
  renewalsThisMonth: Policy[]
}
