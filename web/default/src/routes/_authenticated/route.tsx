import { createFileRoute, redirect, useRouterState } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getSelf } from '@/lib/api'
import { AppShell } from '@/components/layout'
import {
  isAuthenticatedSessionVerified,
  markAuthenticatedSessionVerified,
} from '@/lib/authenticated-session-verified'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // 如果本地没有用户信息，直接跳转登录页
    const redirectTarget = location.href

    if (!auth.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: redirectTarget },
      })
    }

    // 本地有用户信息，但需要验证 session 是否有效（每个会话只验证一次）
    if (!isAuthenticatedSessionVerified()) {
      const res = await getSelf().catch(() => null)
      if (res?.success && res.data) {
        // 验证成功，更新用户信息（可能有变化）
        auth.setUser(res.data)
        markAuthenticatedSessionVerified()
      } else {
        // 验证失败或 API 调用失败，清除本地缓存并跳转登录页
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: redirectTarget },
        })
      }
    }
  },
  component: AuthenticatedAppLayout,
})

function AuthenticatedAppLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  // Viewport-locked product surfaces (Chat / Playground, external chat
  // presets) manage their own scroll, skip the site footer, and do not
  // mount the console sidebar — ChatGPT/Claude-style product chrome.
  const fullscreen =
    pathname.startsWith('/playground') || pathname.startsWith('/chat')

  return (
    <AppShell
      withSidebar={!fullscreen}
      contentMode='bare'
      showFooter={!fullscreen}
    />
  )
}
