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
import DOMPurify from 'dompurify'

/**
 * Sanitize an untrusted HTML string before injecting it via
 * `dangerouslySetInnerHTML`. Strips `<script>`, inline event-handler
 * attributes (`onclick`, …), `javascript:` URLs, and other XSS vectors while
 * preserving safe formatting tags, attributes, and class names so
 * admin-authored content keeps its styling.
 *
 * Use this for ANY admin/user-configured content rendered as raw HTML
 * (footer, about page, legal documents, announcements, …).
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty)
}
