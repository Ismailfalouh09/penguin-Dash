import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { render, screen, waitFor, within } from '@/test/utils/render'
import { apiUrl } from '@/test/mocks/api'
import { server } from '@/test/mocks/server'
import { PackDetailPage } from '../PackDetailPage'
import { makeImage, makePack } from '@/features/packs/__tests__/fixtures'

function renderDetail(packId = 'pack-1', role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/packs/:packId" element={<PackDetailPage />} />
      <Route path="/packs/:packId/edit" element={<div>Edit page</div>} />
      <Route path="/packs" element={<div>Packs list</div>} />
    </Routes>,
    { initialEntries: [`/packs/${packId}`], role }
  )
}

describe('PackDetailPage', () => {
  it('loads and renders pack details, items, attributes, pricing, and media', async () => {
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () =>
        HttpResponse.json(
          makePack({
            name: 'Glow Pack',
            slug: 'glow-pack',
            fixedPrice: 299 as unknown as ReturnType<typeof makePack>['fixedPrice'],
            coverImage: null,
            images: [],
          })
        )
      )
    )

    renderDetail()
    expect(await screen.findByRole('heading', { level: 1, name: 'Glow Pack' })).toBeInTheDocument()
    expect(screen.getByText('glow-pack')).toBeInTheDocument()
    expect(screen.getByText('Foundation X')).toBeInTheDocument()
    expect(
      screen.getByText('Reference is selected later by the configured mode.')
    ).toBeInTheDocument()
    expect((await screen.findAllByText('Skin color')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('Medium')).length).toBeGreaterThan(0)
    expect(screen.getByText('No gallery images yet.')).toBeInTheDocument()
    expect(screen.getByText('299.00')).toBeInTheDocument()
  })

  it('shows a safe not-found state for a missing pack', async () => {
    server.use(
      http.get(apiUrl('/admin/packs/missing'), () =>
        HttpResponse.json({ statusCode: 404, message: 'not found' }, { status: 404 })
      )
    )
    renderDetail('missing')
    expect(await screen.findByText('Could not load pack details.')).toBeInTheDocument()
  })

  it('hides write actions for STAFF', async () => {
    server.use(http.get(apiUrl('/admin/packs/pack-1'), () => HttpResponse.json(makePack())))
    renderDetail('pack-1', 'STAFF')
    await screen.findByRole('heading', { level: 1, name: 'Glow Pack' })
    expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /upload cover/i })).not.toBeInTheDocument()
  })

  it('archives through the confirmation dialog and returns to the pack list', async () => {
    let archived = false
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () => HttpResponse.json(makePack())),
      http.delete(apiUrl('/admin/packs/pack-1'), () => {
        archived = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: /archive/i }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/historical recommendations and orders remain intact/i)
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^archive$/i }))

    await waitFor(() => expect(archived).toBe(true))
    expect(await screen.findByText('Packs list')).toBeInTheDocument()
  })

  it('persists a cover upload after the detail query refetches', async () => {
    let coverImage: ReturnType<typeof makeImage> | null = null
    let getCalls = 0
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () => {
        getCalls += 1
        return HttpResponse.json(
          makePack({
            coverImage,
            images: coverImage ? [coverImage] : [],
          })
        )
      }),
      http.post(apiUrl('/admin/packs/pack-1/images'), async () => {
        coverImage = makeImage({
          id: 'cover-uploaded',
          role: 'COVER',
          altText: 'Studio cover' as unknown as ReturnType<typeof makeImage>['altText'],
        })
        return HttpResponse.json(coverImage, { status: 201 })
      })
    )
    const user = userEvent.setup()
    renderDetail()

    await screen.findByRole('heading', { level: 1, name: 'Glow Pack' })
    await user.type(screen.getByPlaceholderText('Cover alt text'), 'Studio cover')
    await user.upload(
      document.querySelector<HTMLInputElement>('input[aria-label="Upload pack cover image"]')!,
      new File(['cover'], 'cover.jpg', { type: 'image/jpeg' })
    )

    expect(await screen.findByAltText('Studio cover')).toBeInTheDocument()
    await waitFor(() => expect(getCalls).toBeGreaterThan(1))
  })
})
