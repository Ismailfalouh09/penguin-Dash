import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@/test/utils/render'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { ProductGallery } from '../components/ProductGallery'
import { makeImage } from './fixtures'

const PRODUCT_ID = 'prod-1'

function renderGallery(props: Partial<Parameters<typeof ProductGallery>[0]> = {}) {
  return render(
    <ProductGallery
      productId={PRODUCT_ID}
      coverImage={null}
      images={[]}
      canWrite={true}
      {...props}
    />
  )
}

describe('ProductGallery', () => {
  it('renders the cover image when present', () => {
    const cover = makeImage({ id: 'cover-1', role: 'COVER' })
    renderGallery({ coverImage: cover })
    expect(screen.getByAltText('Product cover')).toBeInTheDocument()
  })

  it('shows a placeholder when no cover image exists', () => {
    renderGallery({ coverImage: null })
    // No img with alt for cover; the ImageIcon placeholder renders instead.
    expect(screen.queryByAltText('Product cover')).not.toBeInTheDocument()
  })

  it('renders gallery images in order', () => {
    const images = [
      makeImage({ id: 'g1', role: 'GALLERY', position: 0 }),
      makeImage({ id: 'g2', role: 'GALLERY', position: 1 }),
    ]
    renderGallery({ images })
    expect(screen.getAllByAltText('Gallery image')).toHaveLength(2)
  })

  it('shows "No gallery images yet" when gallery is empty', () => {
    renderGallery({ images: [] })
    expect(screen.getByText('No gallery images yet.')).toBeInTheDocument()
  })

  it('uses altText when it is a string', () => {
    const img = makeImage({
      id: 'g1',
      role: 'GALLERY',
      altText: 'Custom alt' as unknown as typeof img.altText,
    })
    renderGallery({ images: [img] })
    expect(screen.getByAltText('Custom alt')).toBeInTheDocument()
  })

  it('hides upload and delete controls when canWrite is false', () => {
    const cover = makeImage({ id: 'cover-1', role: 'COVER' })
    renderGallery({ coverImage: cover, canWrite: false })
    expect(
      screen.queryByRole('button', { name: /upload|replace|remove|add/i })
    ).not.toBeInTheDocument()
  })

  it('shows upload cover button when canWrite is true', () => {
    renderGallery({ canWrite: true })
    expect(screen.getByRole('button', { name: /upload cover/i })).toBeInTheDocument()
  })

  it('shows replace cover button when a cover exists', () => {
    const cover = makeImage({ id: 'cover-1', role: 'COVER' })
    renderGallery({ coverImage: cover, canWrite: true })
    expect(screen.getByRole('button', { name: /replace cover/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove cover/i })).toBeInTheDocument()
  })

  it('calls the upload endpoint for cover and shows success toast', async () => {
    let uploadCalled = false
    server.use(
      http.post(apiUrl(`/admin/products/${PRODUCT_ID}/images`), () => {
        uploadCalled = true
        return HttpResponse.json(makeImage({ id: 'new', role: 'COVER' }), { status: 201 })
      }),
      http.get(apiUrl(`/admin/products/${PRODUCT_ID}`), () =>
        HttpResponse.json({ data: [], images: [] })
      )
    )
    const user = userEvent.setup()
    renderGallery({ canWrite: true })

    const coverInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Upload cover image"]'
    )!
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    await user.upload(coverInput, file)

    await waitFor(() => expect(uploadCalled).toBe(true))
    expect(await screen.findByText('Cover updated')).toBeInTheDocument()
  })

  it('calls the upload endpoint for gallery and shows success toast', async () => {
    let uploadCalled = false
    server.use(
      http.post(apiUrl(`/admin/products/${PRODUCT_ID}/images`), () => {
        uploadCalled = true
        return HttpResponse.json(makeImage({ id: 'new', role: 'GALLERY' }), { status: 201 })
      }),
      http.get(apiUrl(`/admin/products/${PRODUCT_ID}`), () =>
        HttpResponse.json({ data: [], images: [] })
      )
    )
    const user = userEvent.setup()
    renderGallery({ canWrite: true })

    const galleryInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Add gallery image"]'
    )!
    const file = new File(['img'], 'gallery.jpg', { type: 'image/jpeg' })
    await user.upload(galleryInput, file)

    await waitFor(() => expect(uploadCalled).toBe(true))
    expect(await screen.findByText('Image added')).toBeInTheDocument()
  })

  it('shows an error toast when upload fails', async () => {
    server.use(
      http.post(apiUrl(`/admin/products/${PRODUCT_ID}/images`), () =>
        HttpResponse.json({ statusCode: 422, message: 'Too large' }, { status: 422 })
      )
    )
    const user = userEvent.setup()
    renderGallery({ canWrite: true })

    const coverInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Upload cover image"]'
    )!
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    await user.upload(coverInput, file)

    expect(await screen.findByText('Upload failed')).toBeInTheDocument()
  })

  it('opens a confirm dialog and calls delete endpoint', async () => {
    let deleted = false
    const img = makeImage({ id: 'img-del', role: 'GALLERY' })
    server.use(
      http.delete(apiUrl(`/admin/products/${PRODUCT_ID}/images/img-del`), () => {
        deleted = true
        return HttpResponse.json({})
      }),
      http.get(apiUrl(`/admin/products/${PRODUCT_ID}`), () =>
        HttpResponse.json({ data: [], images: [] })
      )
    )
    const user = userEvent.setup()
    renderGallery({ images: [img], canWrite: true })

    // Hover the gallery item to reveal actions, then click Remove.
    await user.click(screen.getByTitle('Remove image'))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /remove/i }))

    await waitFor(() => expect(deleted).toBe(true))
  })

  it('cancel on remove dialog does not call delete endpoint', async () => {
    let deleted = false
    const img = makeImage({ id: 'img-keep', role: 'GALLERY' })
    server.use(
      http.delete(apiUrl(`/admin/products/${PRODUCT_ID}/images/img-keep`), () => {
        deleted = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderGallery({ images: [img], canWrite: true })

    await user.click(screen.getByTitle('Remove image'))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(deleted).toBe(false)
  })

  it('calls promote-to-cover endpoint and shows success toast', async () => {
    let promoted = false
    const img = makeImage({ id: 'img-promo', role: 'GALLERY' })
    server.use(
      http.patch(apiUrl(`/admin/products/${PRODUCT_ID}/images/img-promo`), async ({ request }) => {
        const body = (await request.json()) as { role: string }
        if (body.role === 'COVER') promoted = true
        return HttpResponse.json(makeImage({ id: 'img-promo', role: 'COVER' }))
      }),
      http.get(apiUrl(`/admin/products/${PRODUCT_ID}`), () =>
        HttpResponse.json({ data: [], images: [] })
      )
    )
    const user = userEvent.setup()
    renderGallery({ images: [img], canWrite: true })

    await user.click(screen.getByTitle('Set as cover'))
    await waitFor(() => expect(promoted).toBe(true))
    expect(await screen.findByText('Cover set')).toBeInTheDocument()
  })

  it('shows error toast when promote-to-cover fails', async () => {
    const img = makeImage({ id: 'img-promo', role: 'GALLERY' })
    server.use(
      http.patch(apiUrl(`/admin/products/${PRODUCT_ID}/images/img-promo`), () =>
        HttpResponse.json({ statusCode: 500, message: 'fail' }, { status: 500 })
      )
    )
    const user = userEvent.setup()
    renderGallery({ images: [img], canWrite: true })

    await user.click(screen.getByTitle('Set as cover'))
    expect(await screen.findByText('Failed')).toBeInTheDocument()
  })
})
