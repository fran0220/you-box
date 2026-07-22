import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  const { t } = useTranslation()
  return (
    <AuthLayout>
      <div className='w-full space-y-8'>
        <div className='space-y-3'>
          <h2 className='font-display text-3xl leading-[1.15] font-normal'>
            {t('Two-factor Authentication')}
          </h2>
          <p className='text-muted-foreground text-left text-sm sm:text-base'>
            {t('Please enter the authentication code.')}
          </p>
          <p className='text-muted-foreground text-left text-sm sm:text-base'>
            {t('Session expired?')}{' '}
            <Link
              to='/sign-in'
              className='text-foreground font-medium underline underline-offset-4 hover:opacity-80'
            >
              {t('Re-login')}
            </Link>
            .
          </p>
        </div>

        <OtpForm />
      </div>
    </AuthLayout>
  )
}
