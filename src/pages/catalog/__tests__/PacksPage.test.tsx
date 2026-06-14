import { describe, expect, it, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@/test/utils/render'
import { apiUrl } from '@/test/mocks/api'
import { server } from '@/test/mocks/server'
import { PacksPage } from '../PacksPage'
import { makePack, makePackPage } from '@/features/packs/__tests__/fixtures'

function listHandler(
  body = makePackPage([makePack()]),
  onRequest?: (url: URL) => void,
  delayMs = 0
) {
  return http.get(apiUrl('/admin/packs'), async ({ request }) => {
    onRequest?.(new URL(request.url))
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
    return HttpResponse.json(body)
  })
}

describe('PacksPage', () => {
  beforeEach(() => {
    server.use(listHandler())
  })

  it('shows a loading state before the list resolves', async () => {
    server.use(listHandler(makePackPage([makePack({ name: 'Glow Pack' })]), undefined, 50))
    render(<PacksPage />, { initialEntries: ['/packs'] })
    expect(document.querySelector('[aria-busy="true"], .animate-pulse')).toBeTruthy()
    expect(await screen.findByText('Glow Pack')).toBeInTheDocument()
  })

  it('shows an empty state when there are no packs', async () => {
    server.use(listHandler(makePackPage([])))
    render(<PacksPage />, { initialEntries: ['/packs'] })
    expect(await screen.findByText('No packs found')).toBeInTheDocument()
  })

  it('shows an error state and recovers on retry', async () => {
    let calls = 0
    server.use(
      http.get(apiUrl('/admin/packs'), () => {
        calls += 1
        if (calls === 1) {
          return HttpResponse.json({ statusCode: 500, message: 'fail' }, { status: 500 })
        }
        return HttpResponse.json(makePackPage([makePack({ name: 'Recovered Pack' })]))
      })
    )
    const user = userEvent.setup()
    render(<PacksPage />, { initialEntries: ['/packs'] })

    expect(await screen.findByText(/couldn't load this list/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry|try again/i }))
    expect(await screen.findByText('Recovered Pack')).toBeInTheDocument()
  })

  it('passes search, filters, pagination, and sort state through the URL', async () => {
    let seen: URL | undefined
    server.use(listHandler(makePackPage([makePack()]), (url) => (seen = url)))
    render(<PacksPage />, {
      initialEntries: [
        '/packs?page=2&limit=10&search=glow&status=ACTIVE&isActive=false&priceMode=FIXED',
      ],
    })

    await screen.findByText('Glow Pack')
    await waitFor(() => {
      expect(seen?.searchParams.get('page')).toBe('2')
      expect(seen?.searchParams.get('pageSize')).toBe('10')
      expect(seen?.searchParams.get('search')).toBe('glow')
      expect(seen?.searchParams.get('status')).toBe('ACTIVE')
      expect(seen?.searchParams.get('isActive')).toBe('false')
      expect(seen?.searchParams.get('priceMode')).toBe('FIXED')
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /name/i }))
    await waitFor(() => {
      expect(seen?.searchParams.get('sortBy')).toBe('name')
      expect(seen?.searchParams.get('sortOrder')).toBe('asc')
    })
  })

  it('shows write actions for OWNER and hides them for STAFF', async () => {
    render(<PacksPage />, { initialEntries: ['/packs'], role: 'OWNER' })
    expect(await screen.findByRole('link', { name: /new pack/i })).toBeInTheDocument()
  })

  it('hides write actions for STAFF', async () => {
    render(<PacksPage />, { initialEntries: ['/packs'], role: 'STAFF' })
    await screen.findByText('Glow Pack')
    expect(screen.queryByRole('link', { name: /new pack/i })).not.toBeInTheDocument()
  })

  it('opens and cancels archive confirmation without mutating', async () => {
    let archived = false
    server.use(
      listHandler(makePackPage([makePack({ id: 'pack-archive', name: 'Glow Pack' })])),
      http.delete(apiUrl('/admin/packs/pack-archive'), () => {
        archived = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    render(<PacksPage />, { initialEntries: ['/packs'], role: 'OWNER' })

    await user.click(await screen.findByRole('button', { name: /actions for glow pack/i }))
    await user.click(await screen.findByRole('menuitem', { name: /archive/i }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/historical recommendations and orders remain intact/i)
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(archived).toBe(false)
  })
})
