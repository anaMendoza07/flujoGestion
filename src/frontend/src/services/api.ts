import axios from 'axios'
import type { Policy, Client, Activity } from '../utils/priority'

const api = axios.create({ baseURL: '/api' })

// ── Clientes ─────────────────────────────────────────────────────────────────
export const getClients = () =>
  api.get<Client[]>('/clients')

export const getClient = (id: number) =>
  api.get<Client>(`/clients/${id}`)

export const createClient = (data: { full_name: string; phone?: string; email?: string }) =>
  api.post<Client>('/clients', data)

export const updateClient = (id: number, data: { full_name: string; phone?: string; email?: string }) =>
  api.put<Client>(`/clients/${id}`, data)

export const deleteClient = (id: number) =>
  api.delete(`/clients/${id}`)

// ── Pólizas ──────────────────────────────────────────────────────────────────
export interface PolicyFilters {
  status?:    string
  priority?:  string
  insurer?:   string
  client_id?: number
}

export const getPolicies = (filters?: PolicyFilters) =>
  api.get<Policy[]>('/policies', { params: filters })

export const getPolicy = (id: number) =>
  api.get<Policy>(`/policies/${id}`)

export const createPolicy = (data: {
  client_id:       number
  policy_type:     string
  insurer:         string
  expiration_date: string
  premium_amount?: number | null
}) => api.post<Policy>('/policies', data)

export const updatePolicy = (id: number, data: Partial<{
  client_id:       number
  policy_type:     string
  insurer:         string
  expiration_date: string
  status:          string
  premium_amount:  number | null
}>) => api.put<Policy>(`/policies/${id}`, data)

export const deletePolicy = (id: number) =>
  api.delete(`/policies/${id}`)

export const renewPolicy = (id: number, new_expiration_date: string) =>
  api.post<Policy>(`/policies/${id}/renew`, { new_expiration_date })

// ── Actividades ───────────────────────────────────────────────────────────────
export const getActivities = (policyId: number) =>
  api.get<Activity[]>(`/policies/${policyId}/activities`)

export const createActivity = (policyId: number, data: { activity_type: string; note?: string }) =>
  api.post<Activity>(`/policies/${policyId}/activities`, data)

// ── Reportes ──────────────────────────────────────────────────────────────────
export const getReportCritical = () =>
  api.get<Policy[]>('/reports/critical')

export const getReportRenewalsMonth = () =>
  api.get<Policy[]>('/reports/renewals-this-month')
