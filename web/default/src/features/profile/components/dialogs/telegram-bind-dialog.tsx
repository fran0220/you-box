import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  telegramAuthToParams,
  type TelegramAuthPayload,
} from '@/lib/telegram-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog } from '@/components/dialog'
import { TelegramLoginWidget } from '@/components/telegram-login-widget'

// ============================================================================
// Telegram Bind Dialog Component
// ============================================================================

interface TelegramBindDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  botName: string
  onSuccess: () => void
}

export function TelegramBindDialog({
  open,
  onOpenChange,
  botName,
  onSuccess,
}: TelegramBindDialogProps) {
  const { t } = useTranslation()

  const handleTelegramAuth = async (payload: TelegramAuthPayload) => {
    try {
      const res = await api.get('/api/oauth/telegram/bind', {
        params: telegramAuthToParams(payload),
      })
      const { success, message } = res.data as {
        success: boolean
        message?: string
      }
      if (success) {
        toast.success(t('Telegram account bound successfully'))
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(message || t('Failed to bind Telegram account'))
      }
    } catch (_error) {
      toast.error(t('Failed to bind Telegram account'))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('Bind Telegram Account')}
      description={t('Click the button below to bind your Telegram account')}
      contentClassName='sm:max-w-md'
      contentHeight='auto'
      bodyClassName='space-y-4'
    >
      <div className='space-y-4 py-4'>
        <Alert>
          <Send className='h-4 w-4' />
          <AlertDescription>
            {t(
              'You will be redirected to Telegram to complete the binding process.'
            )}
          </AlertDescription>
        </Alert>

        <div className='flex flex-col items-center justify-center gap-4 rounded-lg border p-6'>
          <div className='bg-info-subtle flex h-12 w-12 items-center justify-center rounded-xl'>
            <Send className='text-info h-6 w-6' />
          </div>

          <div className='text-center'>
            <p className='text-muted-foreground text-sm'>
              {t('Bot:')}{' '}
              <span className='font-mono font-semibold'>@{botName}</span>
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              {t(
                "After clicking the button, you'll be asked to authorize the bot"
              )}
            </p>
          </div>

          <TelegramLoginWidget
            botName={botName}
            onAuth={handleTelegramAuth}
            className='flex justify-center'
          />
        </div>

        <p className='text-muted-foreground text-center text-xs'>
          {t('The binding will complete automatically after authorization')}
        </p>
      </div>
    </Dialog>
  )
}
