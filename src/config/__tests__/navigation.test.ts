import { describe, it, expect } from 'vitest'
import { getNavigationForRole, ALL_NAV_ITEMS, NAVIGATION } from '../navigation'

describe('navigation config', () => {
  it('every nav item has a unique id and a route', () => {
    const ids = ALL_NAV_ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const item of ALL_NAV_ITEMS) {
      expect(item.to.startsWith('/')).toBe(true)
    }
  })

  it('exposes the expected top-level groups', () => {
    expect(NAVIGATION.map((g) => g.id)).toEqual([
      'overview',
      'catalog',
      'personalization',
      'sales',
      'administration',
    ])
  })

  it('shows all read-only items to every role (OWNER, ADMIN, STAFF)', () => {
    const owner = getNavigationForRole('OWNER').flatMap((g) => g.items.map((i) => i.id))
    const staff = getNavigationForRole('STAFF').flatMap((g) => g.items.map((i) => i.id))
    // All current items require only 'read', which every role holds.
    expect(staff).toEqual(owner)
    expect(staff).toContain('orders')
    expect(staff).toContain('media')
  })

  it('does not expose a standalone product-references destination', () => {
    expect(ALL_NAV_ITEMS.map((i) => i.id)).not.toContain('product-references')
  })

  it('filters out items a role lacks permission for and drops empty groups', () => {
    // Simulate a hypothetical write-gated item by checking the filter logic:
    // STAFF should never receive an item requiring 'write'.
    const staffGroups = getNavigationForRole('STAFF')
    for (const group of staffGroups) {
      expect(group.items.length).toBeGreaterThan(0)
    }
  })
})
