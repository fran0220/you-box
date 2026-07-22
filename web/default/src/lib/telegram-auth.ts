
/**
 * Payload delivered by the official Telegram Login Widget after the user
 * authorizes the bot. The `hash` is verified server-side against the bot
 * token (see controller/telegram.go).
 */
export type TelegramAuthPayload = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
  lang?: string
}

/**
 * Serialize the widget payload into the query params expected by
 * /api/oauth/telegram/login and /api/oauth/telegram/bind.
 */
export function telegramAuthToParams(
  payload: TelegramAuthPayload
): Record<string, string> {
  const fields = [
    'id',
    'first_name',
    'last_name',
    'username',
    'photo_url',
    'auth_date',
    'hash',
    'lang',
  ] as const
  const params: Record<string, string> = {}
  for (const field of fields) {
    const value = payload[field]
    if (value !== undefined && value !== null && value !== '') {
      params[field] = String(value)
    }
  }
  return params
}
