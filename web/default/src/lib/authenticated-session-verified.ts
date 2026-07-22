
let sessionVerified = false

export function isAuthenticatedSessionVerified(): boolean {
  return sessionVerified
}

export function markAuthenticatedSessionVerified(): void {
  sessionVerified = true
}

export function resetAuthenticatedSessionVerification(): void {
  sessionVerified = false
}
