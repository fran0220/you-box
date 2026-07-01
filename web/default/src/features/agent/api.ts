import { api } from '@/lib/api'

export type AgentDevice = {
  id: number
  device_id: string
  device_label: string
  platform: string
  app_version: string
  scopes: string
  last_used_at: number
  revoked_at: number
  active: boolean
  created_at: number
}

type ApiSuccess<T> = {
  success: boolean
  message: string
  data: T
}

export async function authorizeAgentDevice(params: {
  client_id: string
  device_id: string
  device_label: string
  state: string
  code_challenge: string
  code_challenge_method: 'S256'
}): Promise<ApiSuccess<{ code: string; redirect_uri: string; expires_in: number }>> {
  const res = await api.post('/api/agent/auth/authorize', params)
  return res.data
}

export async function listAgentDevices(): Promise<ApiSuccess<AgentDevice[]>> {
  const res = await api.get('/api/agent/devices')
  return res.data
}

export async function revokeAgentDevice(id: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/api/agent/devices/${id}`)
  return res.data
}
