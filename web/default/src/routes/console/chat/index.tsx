import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/chat/')({
  beforeLoad: () => {
    throw redirect({ to: '/chat/$chatId', params: { chatId: '0' } })
  },
})
