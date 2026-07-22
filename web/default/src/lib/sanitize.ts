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
