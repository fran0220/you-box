import { useMemo, useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Loader2, MessageCircleWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createLazyComponent } from '@/lib/lazy-route-component'
import { isSidebarModuleEnabled } from '@/lib/nav-modules'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/youbox'
import { useActiveChatKey } from '@/features/chat/hooks/use-active-chat-key'
import { useChatPresets } from '@/features/chat/hooks/use-chat-presets'
import {
  chatLinkRequiresApiKey,
  resolveChatUrl,
} from '@/features/chat/lib/chat-links'

const ChatShell = createLazyComponent(async () => ({
  default: (await import('@/features/chat/components/chat-shell')).ChatShell,
}))

export const Route = createFileRoute('/_authenticated/chat/$chatId')({
  beforeLoad: () => {
    if (!isSidebarModuleEnabled('chat', 'chat')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ params }) => {
    if (!Number.isInteger(Number(params.chatId))) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: ChatRouteComponent,
})

function ChatIframe({ src, presetName }: { src: string; presetName: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className='relative h-full w-full'>
      {!loaded && (
        <div className='absolute inset-0 p-4'>
          <Skeleton className='h-full w-full' />
        </div>
      )}
      <iframe
        src={src}
        className='h-full w-full border-0'
        allow='camera; microphone'
        title={`Chat preset: ${presetName}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

function ChatRouteComponent() {
  const { t } = useTranslation()
  const { chatId } = Route.useParams()
  const { chatPresets, serverAddress } = useChatPresets()
  const preset = useMemo(() => {
    const index = Number(chatId)
    if (!Number.isInteger(index)) return undefined
    return chatPresets[index]
  }, [chatId, chatPresets])

  const isWebLink = preset?.type === 'web'

  const requiresActiveKey = useMemo(() => {
    if (!preset || !isWebLink) return false
    return chatLinkRequiresApiKey(preset.url ?? '')
  }, [isWebLink, preset])

  const {
    data: activeKey,
    isPending,
    isError,
    error,
  } = useActiveChatKey(Boolean(preset && requiresActiveKey))

  const iframeSrc = useMemo(() => {
    if (!preset || !isWebLink) return ''
    if (requiresActiveKey && !activeKey) return ''
    return resolveChatUrl({
      template: preset.url,
      apiKey: requiresActiveKey ? activeKey : undefined,
      serverAddress,
    })
  }, [activeKey, isWebLink, preset, requiresActiveKey, serverAddress])

  const content = (() => {
    if (!preset) {
      return (
        <EmptyState
          className='h-full'
          icon={MessageCircleWarning}
          title={t('Chat preset not found')}
          description={t(
            'The requested chat preset does not exist or has been removed.'
          )}
          action={
            <Button variant='outline' render={<Link to='/dashboard' />}>
              {t('Return to dashboard')}
            </Button>
          }
        />
      )
    }

    if (!isWebLink) {
      return (
        <EmptyState
          className='h-full'
          icon={MessageCircleWarning}
          title={t('Use sidebar shortcut')}
          description={
            <>
              <span className='text-foreground font-medium'>{preset.name}</span>{' '}
              {t(
                'opens in an external client. Trigger it from the sidebar or API key actions to launch the configured application.'
              )}
            </>
          }
          action={
            <Button variant='outline' render={<Link to='/dashboard' />}>
              {t('Return to dashboard')}
            </Button>
          }
        />
      )
    }

    if (requiresActiveKey && isPending) {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4'>
          <Loader2
            aria-hidden='true'
            className='text-muted-foreground size-8 animate-spin'
          />
          <p className='text-muted-foreground font-mono text-sm'>
            {t('Preparing your chat link…')}
          </p>
        </div>
      )
    }

    if (requiresActiveKey && (isError || !activeKey || !iframeSrc)) {
      const message =
        error instanceof Error
          ? error.message
          : t('Unable to generate chat link. Please check your API keys.')
      return (
        <div className='flex h-full flex-col items-center justify-center p-6'>
          <Alert variant='destructive' className='max-w-xl'>
            <AlertTitle>{t('Unable to open chat')}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )
    }

    if (!requiresActiveKey && !iframeSrc) {
      return (
        <div className='flex h-full flex-col items-center justify-center p-6'>
          <Alert variant='destructive' className='max-w-xl'>
            <AlertTitle>{t('Unable to open chat')}</AlertTitle>
            <AlertDescription>
              {t(
                'Unable to generate chat link. Please contact your administrator.'
              )}
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return (
      <ChatIframe key={iframeSrc} src={iframeSrc} presetName={preset.name} />
    )
  })()

  return (
    <div className='flex h-[calc(100svh-var(--app-header-height,0px))] min-h-0 flex-col overflow-hidden'>
      <ChatShell activeChatId={chatId} preset={preset} resolvedUrl={iframeSrc}>
        {content}
      </ChatShell>
    </div>
  )
}
