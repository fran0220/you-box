import { createFileRoute } from '@tanstack/react-router'
import { AgentDevices } from '@/features/agent'

export const Route = createFileRoute('/_authenticated/agent/devices')({
  component: AgentDevices,
})