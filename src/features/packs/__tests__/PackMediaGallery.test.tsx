import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@/test/utils/render'
import { apiUrl } from '@/test/mocks/api'
import { server } from '@/test/mocks/server'
import { PackMediaGallery } from '../components/PackMediaGallery'
import { makeImage } from './fixtures'

const PACK_ID = 'pack-1'

function renderGallery(props: Partial<Parameters<typeof PackMediaGallery>[0]> = {}) {
  return render(
    <PackMediaGallery packId={PACK_ID} coverImage={null} images={[]} canWrite={true} {...props} />
  )
}

describe('PackMediaGallery', () => {
  it('renders cover and gallery media with accessible labels', () => {
    renderGallery({
      coverImage: makeImage({ id: 'cover-1', role: 'COVER' }),
      images: [makeImage({ id: 'gallery-1', role: 'GALLERY' })],
    })

    expect(screen.getByRole('button', { name: /replace cover/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument()
    expect(screen.getByAltText('Pack cover')).toBeInTheDocument()
    expect(screen.getAllByAltText('Pack gallery image')).toHaveLength(1)
  })

  it('uploads a cover image and clears the optimistic preview when the upload fails', async () => {
    server.use(
      http.post(apiUrl(`/admin/packs/${PACK_ID}/images`), async () => {
        return HttpResponse.json({ statusCode: 422, message: 'fail' }, { status: 422 })
      })
    )
    const user = userEvent.setup()
    renderGallery()

    await user.type(screen.getByPlaceholderText('Cover alt text'), 'Hero cover')
    await user.upload(
      screen.getByLabelText('Upload pack cover image'),
      new File(['cover'], 'cover.jpg', { type: 'image/jpeg' })
    )

    expect(await screen.findByText('Upload failed')).toBeInTheDocument()
    expect(screen.queryByAltText('Pack cover')).not.toBeInTheDocument()
  })

  it('uploads gallery images, reorders them, and promotes an image to cover', async () => {
    let uploaded = false
    let reordered = false
    let promoted = false
    server.use(
      http.post(apiUrl(`/admin/packs/${PACK_ID}/images`), async () => {
        uploaded = true
        return HttpResponse.json(makeImage({ id: 'gallery-new', role: 'GALLERY' }), {
          status: 201,
        })
      }),
      http.patch(apiUrl(`/admin/packs/${PACK_ID}/images/reorder`), async () => {
        reordered = true
        return HttpResponse.json([makeImage({ id: 'gallery-a' }), makeImage({ id: 'gallery-b' })])
      }),
      http.patch(apiUrl(`/admin/packs/${PACK_ID}/images/gallery-b`), async ({ request }) => {
        const body = (await request.json()) as { role: string }
        promoted = body.role === 'COVER'
        return HttpResponse.json(makeImage({ id: 'gallery-b', role: 'COVER' }))
      })
    )
    const user = userEvent.setup()
    renderGallery({
      images: [
        makeImage({ id: 'gallery-a', role: 'GALLERY', position: 0 }),
        makeImage({ id: 'gallery-b', role: 'GALLERY', position: 1 }),
      ],
    })

    await user.upload(
      screen.getByLabelText('Add pack gallery image'),
      new File(['gallery'], 'gallery.jpg', { type: 'image/jpeg' })
    )
    await waitFor(() => expect(uploaded).toBe(true))
    expect(await screen.findByText('Image added')).toBeInTheDocument()

    await user.click(screen.getAllByTitle('Move image later')[0]!)
    await waitFor(() => expect(reordered).toBe(true))
    await user.click(screen.getAllByTitle('Set as cover')[1]!)
    await waitFor(() => expect(promoted).toBe(true))
  })

  it('removes a cover image through the confirmation dialog', async () => {
    let removed = false
    server.use(
      http.delete(apiUrl(`/admin/packs/${PACK_ID}/images/cover-1`), () => {
        removed = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderGallery({
      coverImage: makeImage({ id: 'cover-1', role: 'COVER' }),
    })

    await user.click(screen.getByRole('button', { name: /^remove$/i }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /remove/i }))

    await waitFor(() => expect(removed).toBe(true))
  })
})
