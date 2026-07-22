import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout'

/**
 * Pathless layout for all public/marketing pages. Mounting the shell here
 * (instead of inside each feature) keeps the header and footer alive across
 * public-page navigations, so switching between /docs, /pricing, /apps, ...
 * no longer rebuilds the chrome.
 */
export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return <AppShell />
}
