import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/chat/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/chat/$chatId', params: { chatId: params.id } })
  },
})
