import { describe, it, expect } from 'vitest'
import { hasPermission, hasAnyRole, ROLES } from '../roles'

describe('roles & permissions', () => {
  it('grants read to every role', () => {
    for (const role of ROLES) {
      expect(hasPermission(role, 'read')).toBe(true)
    }
  })

  it('grants write to OWNER and ADMIN only', () => {
    expect(hasPermission('OWNER', 'write')).toBe(true)
    expect(hasPermission('ADMIN', 'write')).toBe(true)
    expect(hasPermission('STAFF', 'write')).toBe(false)
  })

  it('restricts media management and order status to write roles', () => {
    expect(hasPermission('OWNER', 'media:manage')).toBe(true)
    expect(hasPermission('STAFF', 'media:manage')).toBe(false)
    expect(hasPermission('ADMIN', 'orders:update-status')).toBe(true)
    expect(hasPermission('STAFF', 'orders:update-status')).toBe(false)
  })

  it('allows recommendation preview for all roles', () => {
    for (const role of ROLES) {
      expect(hasPermission(role, 'recommendations:preview')).toBe(true)
    }
  })

  it('checks role membership', () => {
    expect(hasAnyRole('OWNER', ['OWNER', 'ADMIN'])).toBe(true)
    expect(hasAnyRole('STAFF', ['OWNER', 'ADMIN'])).toBe(false)
  })
})
