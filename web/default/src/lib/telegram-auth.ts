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
