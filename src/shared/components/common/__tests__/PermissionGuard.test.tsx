import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { PermissionGuard } from '../PermissionGuard'

describe('PermissionGuard', () => {
  it('renders children when the role has the permission', () => {
    render(
      <PermissionGuard permission="write">
        <button>Create</button>
      </PermissionGuard>,
      { role: 'OWNER' }
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('hides children when the role lacks the permission', () => {
    render(
      <PermissionGuard permission="write">
        <button>Create</button>
      </PermissionGuard>,
      { role: 'STAFF' }
    )
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument()
  })

  it('renders the fallback when access is denied', () => {
    render(
      <PermissionGuard permission="write" fallback={<span>Read only</span>}>
        <button>Create</button>
      </PermissionGuard>,
      { role: 'STAFF' }
    )
    expect(screen.getByText('Read only')).toBeInTheDocument()
  })

  it('supports role-based gating', () => {
    render(
      <PermissionGuard roles={['OWNER']}>
        <span>Owner only</span>
      </PermissionGuard>,
      { role: 'ADMIN' }
    )
    expect(screen.queryByText('Owner only')).not.toBeInTheDocument()
  })
})
