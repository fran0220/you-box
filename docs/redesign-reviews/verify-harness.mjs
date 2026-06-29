import { chromium } from 'playwright'
import fs from 'fs'

const BASE = 'http://localhost:3000'
const OUT = '/tmp/yb-verify/shots'
const WIDTHS = [375, 768, 1280, 1536]
const HEIGHT = { 375: 812, 768: 1024, 1280: 900, 1536: 960 }

const PUBLIC_ROUTES = [
  ['home', '/'],
  ['about', '/about'],
  ['pricing-card', '/pricing?view=card'],
  ['pricing-table', '/pricing?view=table'],
  ['model-details', '/pricing/gpt-4o'],
  ['rankings', '/rankings'],
  ['apps', '/apps'],
  ['status', '/status'],
  ['docs', '/docs'],
  ['legal-privacy', '/legal/privacy'],
  ['legal-terms', '/legal/terms'],
  ['privacy-policy', '/privacy-policy'],
  ['user-agreement', '/user-agreement'],
  ['sign-in', '/sign-in'],
  ['sign-up', '/sign-up'],
  ['register', '/register'],
  ['forgot-password', '/forgot-password'],
  ['reset', '/reset'],
  ['user-reset', '/user/reset'],
  ['otp', '/otp'],
  ['oauth', '/oauth'],
  ['err-401', '/401'],
  ['err-403', '/403'],
  ['err-404', '/404'],
  ['err-500', '/500'],
  ['err-503', '/503'],
  ['route-notfound', '/this-route-does-not-exist'],
]

const AUTH_ROUTES = [
  ['dashboard-overview', '/dashboard/overview'],
  ['dashboard-models', '/dashboard/models'],
  ['dashboard-users', '/dashboard/users'],
  ['keys', '/keys'],
  ['wallet', '/wallet'],
  ['profile', '/profile'],
  ['playground', '/playground'],
  ['chat-0', '/chat/0'],
  ['usage-logs-common', '/usage-logs/common'],
  ['usage-logs-drawing', '/usage-logs/drawing'],
  ['usage-logs-task', '/usage-logs/task'],
  ['channels', '/channels'],
  ['users', '/users'],
  ['redemption-codes', '/redemption-codes'],
  ['subscriptions', '/subscriptions'],
  ['models-metadata', '/models/metadata'],
  ['models-deployments', '/models/deployments'],
  ['console-log', '/console/log'],
  ['console-topup', '/console/topup'],
  ['setup-after-init', '/setup'],
]

const SETTINGS = {
  site: ['system-info', 'notice', 'header-navigation', 'sidebar-modules'],
  auth: ['basic-auth', 'oauth', 'passkey', 'bot-protection', 'custom-oauth'],
  billing: ['quota', 'currency', 'model-pricing', 'group-pricing', 'payment', 'checkin'],
  content: ['dashboard', 'announcements', 'api-info', 'faq', 'uptime-kuma', 'chat', 'drawing'],
  models: ['global', 'gemini', 'claude', 'grok', 'channel-affinity', 'model-deployment'],
  operations: ['behavior', 'monitoring', 'email', 'worker', 'logs', 'performance', 'update-checker'],
  security: ['rate-limit', 'sensitive-words', 'ssrf'],
}
for (const [group, sections] of Object.entries(SETTINGS)) {
  for (const s of sections) {
    AUTH_ROUTES.push([`settings-${group}-${s}`, `/system-settings/${group}/${s}`])
  }
}

const report = []

async function visit(ctx, name, route, { lightToo = true } = {}) {
  const page = await ctx.newPage()
  const entry = {
    name,
    route,
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    finalPath: null,
    textLen: 0,
    flags: [],
  }
  page.on('pageerror', (e) => entry.pageErrors.push(String(e.message).slice(0, 200)))
  page.on('console', (m) => {
    if (m.type() === 'error') entry.consoleErrors.push(m.text().slice(0, 200))
  })
  page.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BASE) && r.status() >= 400) {
      entry.failedRequests.push(r.status() + ' ' + u.slice(BASE.length, BASE.length + 80))
    }
  })
  try {
    await page.setViewportSize({ width: 1280, height: HEIGHT[1280] })
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 20000 })
    await page.waitForTimeout(1600)
    entry.finalPath = new URL(page.url()).pathname + new URL(page.url()).search
    const text = await page.evaluate(() => document.body.innerText || '')
    entry.textLen = text.length
    if (text.length < 30) entry.flags.push('NEAR_BLANK')
    if (/something went wrong|unexpected error|error boundary/i.test(text))
      entry.flags.push('ERROR_BOUNDARY')
    const dir = `${OUT}/${name}`
    fs.mkdirSync(dir, { recursive: true })
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: HEIGHT[w] })
      await page.waitForTimeout(450)
      await page.screenshot({ path: `${dir}/dark-${w}.png` })
    }
    // horizontal overflow check at 375
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    if (overflow > 4) entry.flags.push(`H_OVERFLOW_375:${overflow}px`)
    if (lightToo) {
      await ctx.addCookies([
        { name: 'vite-ui-theme', value: 'light', url: BASE },
      ])
      await page.setViewportSize({ width: 1280, height: HEIGHT[1280] })
      await page.reload({ waitUntil: 'load', timeout: 20000 })
      await page.waitForTimeout(1200)
      await page.screenshot({ path: `${dir}/light-1280.png` })
      await ctx.addCookies([
        { name: 'vite-ui-theme', value: 'dark', url: BASE },
      ])
    }
  } catch (e) {
    entry.flags.push('VISIT_FAILED: ' + String(e.message).slice(0, 150))
  }
  await page.close()
  report.push(entry)
  const bad =
    entry.flags.length || entry.pageErrors.length || entry.consoleErrors.length || entry.failedRequests.length
  console.log((bad ? 'WARN ' : 'ok   ') + name + ' -> ' + entry.finalPath)
}

const browser = await chromium.launch()

// Pass 1: logged-out/public
const pubCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
for (const [name, route] of PUBLIC_ROUTES) await visit(pubCtx, 'pub-' + name, route)
await pubCtx.close()

// Pass 2: authenticated (root/admin)
const authCtx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  storageState: '/tmp/yb-verify/state.json',
})
for (const [name, route] of AUTH_ROUTES) await visit(authCtx, 'auth-' + name, route)
await authCtx.close()

await browser.close()
fs.writeFileSync('/tmp/yb-verify/report.json', JSON.stringify(report, null, 1))
const warns = report.filter(
  (e) => e.flags.length || e.pageErrors.length || e.consoleErrors.length || e.failedRequests.length,
)
console.log(`\n=== ${report.length} routes, ${warns.length} with warnings ===`)
for (const w of warns)
  console.log(
    w.name,
    JSON.stringify({ f: w.flags, pe: w.pageErrors.slice(0, 2), ce: w.consoleErrors.slice(0, 2), fr: w.failedRequests.slice(0, 4) }),
  )
