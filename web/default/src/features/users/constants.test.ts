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
