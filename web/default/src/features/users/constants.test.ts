import { describe, expect, it } from 'vitest'
import { USER_ROLE, USER_ROLES, USER_STATUS, USER_STATUSES } from './constants'

describe('USER_ROLES badge variants', () => {
  it('maps Root to info, Admin to brand, User to neutral (monochrome tones)', () => {
    expect(USER_ROLES[USER_ROLE.ROOT].variant).toBe('info')
    expect(USER_ROLES[USER_ROLE.ADMIN].variant).toBe('brand')
    expect(USER_ROLES[USER_ROLE.USER].variant).toBe('neutral')
  })
})

describe('USER_STATUSES', () => {
  it('maps enabled to success and disabled to danger', () => {
    expect(USER_STATUSES[USER_STATUS.ENABLED].variant).toBe('success')
    expect(USER_STATUSES[USER_STATUS.DISABLED].variant).toBe('danger')
  })
})
