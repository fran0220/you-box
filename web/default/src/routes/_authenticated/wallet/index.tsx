import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { createLazyComponent } from '@/lib/lazy-route-component'

const Wallet = createLazyComponent(async () => ({
  default: (await import('@/features/wallet')).Wallet,
}))

const walletSearchSchema = z.object({
  show_history: z.boolean().optional(),
})

export const Route = createFileRoute('/_authenticated/wallet/')({
  component: RouteComponent,
  validateSearch: walletSearchSchema,
})

function RouteComponent() {
  const { show_history } = Route.useSearch()
  return <Wallet initialShowHistory={show_history} />
}
