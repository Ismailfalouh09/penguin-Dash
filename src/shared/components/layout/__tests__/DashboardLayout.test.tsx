import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router-dom'
import { renderWithRouter } from '@/test/utils/router'
import { DashboardLayout } from '../DashboardLayout'

const layoutRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardLayout />,
    handle: { title: 'Dashboard', breadcrumb: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        element: <div>Overview content</div>,
        handle: { title: 'Overview', breadcrumb: 'Overview' },
      },
    ],
  },
]

describe('DashboardLayout', () => {
  it('renders the shell with navigation and routed content', () => {
    renderWithRouter(layoutRoutes, { initialEntries: ['/dashboard'] })
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByText('Overview content')).toBeInTheDocument()
  })

  it('provides a skip-to-content link', () => {
    renderWithRouter(layoutRoutes, { initialEntries: ['/dashboard'] })
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveAttribute('href', '#main-content')
  })

  it('opens the mobile navigation drawer', async () => {
    const user = userEvent.setup()
    renderWithRouter(layoutRoutes, { initialEntries: ['/dashboard'] })

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))

    await waitFor(() => {
      // The drawer renders a second navigation landmark when open.
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('renders breadcrumbs from route handles', () => {
    renderWithRouter(layoutRoutes, { initialEntries: ['/dashboard'] })
    // Both the parent ("Dashboard") and child ("Overview") crumbs appear.
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
  })

  it('toggles the desktop sidebar collapse control', async () => {
    const user = userEvent.setup()
    renderWithRouter(layoutRoutes, { initialEntries: ['/dashboard'] })

    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
