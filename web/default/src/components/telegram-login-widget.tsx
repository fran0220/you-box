/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
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
