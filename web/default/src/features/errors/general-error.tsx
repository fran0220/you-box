import { useNavigate, useRouter } from '@tanstack/react-router'
import { ServerCrash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getHttpStatus } from './lib/http-status'
import { ErrorPageShell } from './error-page-shell'

const FEEDBACK_URL = '/about'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
  error?: unknown
}

export function GeneralError({
  className,
  minimal = false,
  error,
}: GeneralErrorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  const status = getHttpStatus(error)
  const isRateLimited = status === 429
  const title = isRateLimited
    ? t('Too many requests')
    : `${t('Oops! Something went wrong')} ${`:')`}`
  const description = isRateLimited
    ? t('Please wait a moment before trying again.')
    : t('Please try again later.')

  if (minimal) {
    return (
      <div
        className={cn(
          'bg-background text-foreground flex h-svh w-full items-center justify-center px-6',
          className
        )}
      >
        <div className='flex max-w-md flex-col items-center gap-2 text-center'>
          <span className='font-display text-text-strong font-semibold'>
            {title}
          </span>
          <p className='text-text-secondary text-center text-sm leading-relaxed'>
            {t('We apologize for the inconvenience.')} <br /> {description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorPageShell
      className={className}
      code={status ?? 500}
      icon={ServerCrash}
      title={title}
      description={
        <>
          {t('We apologize for the inconvenience.')} <br /> {description}
        </>
      }
      footnote={t(
        'If this keeps happening, please report it on GitHub Issues.'
      )}
      actions={
        <>
          <Button variant='secondary' onClick={() => history.go(-1)}>
            {t('Go Back')}
          </Button>
          <Button
            variant='secondary'
            render={
              <a
                href={FEEDBACK_URL}
                target='_blank'
                rel='noopener noreferrer'
              />
            }
          >
            {t('Report an issue')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('Back to Home')}
          </Button>
        </>
      }
    />
  )
}
