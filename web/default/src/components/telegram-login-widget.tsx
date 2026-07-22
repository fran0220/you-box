import { useEffect, useRef } from 'react'
import type { TelegramAuthPayload } from '@/lib/telegram-auth'

const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22'

type TelegramLoginWidgetProps = {
  botName: string
  onAuth: (payload: TelegramAuthPayload) => void
  className?: string
}

let widgetCallbackCounter = 0

/**
 * Renders the official Telegram Login Widget button by injecting the
 * telegram-widget.js script with data attributes. The widget itself opens
 * the Telegram OAuth popup and invokes our global callback with the signed
 * payload — there is no way to trigger this flow from a custom button
 * because the popup must be opened by the widget iframe.
 */
export function TelegramLoginWidget(props: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const onAuthRef = useRef(props.onAuth)

  useEffect(() => {
    onAuthRef.current = props.onAuth
  }, [props.onAuth])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !props.botName) return

    widgetCallbackCounter += 1
    const callbackName = `__telegramLoginCallback${widgetCallbackCounter}`
    const w = window as unknown as Record<string, unknown>
    w[callbackName] = (payload: TelegramAuthPayload) => {
      onAuthRef.current(payload)
    }

    const script = document.createElement('script')
    script.src = TELEGRAM_WIDGET_SRC
    script.async = true
    script.setAttribute('data-telegram-login', props.botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    container.appendChild(script)

    return () => {
      container.replaceChildren()
      delete w[callbackName]
    }
  }, [props.botName])

  return <div ref={containerRef} className={props.className} />
}
