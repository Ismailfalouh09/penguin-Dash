import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Star, Trash2, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import {
  usePackImageDelete,
  usePackImageReorder,
  usePackImageUpdate,
  usePackImageUpload,
} from '../hooks/use-packs'
import { PackMediaControllerUploadBodyRole } from '@/lib/api/generated/models/packMediaControllerUploadBodyRole'
import type { MediaImageResponse } from '@/lib/api'

interface PackMediaGalleryProps {
  packId: string
  coverImage?: MediaImageResponse | null
  images: MediaImageResponse[]
  canWrite: boolean
}

export function PackMediaGallery({
  packId,
  coverImage: coverImageProp,
  images,
  canWrite,
}: PackMediaGalleryProps) {
  const coverImage = coverImageProp ?? images.find((img) => img.role === 'COVER') ?? null
  const { toast } = useToast()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const deleteConfirm = useConfirmDialog<MediaImageResponse>()
  const upload = usePackImageUpload(packId)
  const remove = usePackImageDelete(packId)
  const update = usePackImageUpdate(packId)
  const reorder = usePackImageReorder(packId)
  const [coverAltText, setCoverAltText] = useState(
    typeof coverImage?.altText === 'string' ? coverImage.altText : ''
  )
  const [galleryAltText, setGalleryAltText] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const clearCoverPreview = useCallback(() => {
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  useEffect(() => {
    setCoverAltText(typeof coverImage?.altText === 'string' ? coverImage.altText : '')
    // Once the query refetches with the new cover, discard the local blob preview.
    clearCoverPreview()
  }, [clearCoverPreview, coverImage?.altText, coverImage?.id])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPreviewUrl])

  const [activeImageId, setActiveImageId] = useState<string | null>(null)

  const galleryImages = images
    .filter((image) => image.role !== 'COVER')
    .sort((a, b) => a.position - b.position)

  const handleUpload = async (
    file: File,
    role: PackMediaControllerUploadBodyRole,
    altText?: string
  ) => {
    const result = await upload.mutate({
      file,
      role,
      ...(altText ? { altText } : {}),
    })
    if (result && result.status === 201) {
      toast({
        tone: 'success',
        title: role === 'COVER' ? 'Cover updated' : 'Image added',
        description:
          role === 'COVER'
            ? 'The pack cover image has been updated.'
            : 'The gallery image has been added.',
      })
      return true
    } else {
      toast({
        tone: 'error',
        title: 'Upload failed',
        description: 'Could not upload the pack image.',
      })
      return false
    }
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return localUrl
    })
    const uploaded = await handleUpload(file, PackMediaControllerUploadBodyRole.COVER, coverAltText)
    if (!uploaded) clearCoverPreview()
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleUpload(file, PackMediaControllerUploadBodyRole.GALLERY, galleryAltText)
    setGalleryAltText('')
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const handleDeleteConfirm = async () => {
    const target = deleteConfirm.target
    if (!target) return
    const result = await remove.mutate(target.id)
    deleteConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Image removed',
        description: 'The pack image has been removed.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Remove failed',
        description: 'Could not remove the pack image.',
      })
    }
  }

  const handlePromote = async (image: MediaImageResponse) => {
    setActiveImageId(image.id)
    const result = await update.mutate(image.id, { role: 'COVER' })
    setActiveImageId(null)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Cover set',
        description: 'This image is now the pack cover.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Update failed',
        description: 'Could not set this image as cover.',
      })
    }
  }

  const handleMove = async (image: MediaImageResponse, direction: -1 | 1) => {
    const currentIndex = galleryImages.findIndex((candidate) => candidate.id === image.id)
    const nextIndex = currentIndex + direction
    const nextImage = galleryImages[nextIndex]
    if (currentIndex < 0 || !nextImage) return

    const nextOrder = galleryImages.map((candidate, index) => {
      if (index === currentIndex) return nextImage
      if (index === nextIndex) return image
      return candidate
    })

    setActiveImageId(image.id)
    const result = await reorder.mutate({
      items: nextOrder.map((candidate, index) => ({ imageId: candidate.id, position: index })),
    })
    setActiveImageId(null)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Gallery reordered',
        description: 'Pack image order updated.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Reorder failed',
        description: 'Could not reorder pack images.',
      })
    }
  }

  const isPending = upload.isPending || remove.isPending || update.isPending || reorder.isPending

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Cover image</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {coverPreviewUrl || coverImage ? (
              <img
                src={coverPreviewUrl ?? coverImage!.urls.card}
                alt={typeof coverImage?.altText === 'string' ? coverImage.altText : 'Pack cover'}
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            )}
            {upload.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>

          {canWrite && (
            <div className="space-y-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleCoverUpload}
                disabled={isPending}
                aria-label="Upload pack cover image"
              />
              <input
                type="text"
                value={coverAltText}
                onChange={(event) => setCoverAltText(event.target.value)}
                placeholder="Cover alt text"
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {coverImage ? 'Replace cover' : 'Upload cover'}
                </Button>
                {coverImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => deleteConfirm.open(coverImage)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-medium">Gallery</h3>
          {canWrite && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleGalleryUpload}
                disabled={isPending}
                aria-label="Add pack gallery image"
              />
              <input
                type="text"
                value={galleryAltText}
                onChange={(event) => setGalleryAltText(event.target.value)}
                placeholder="Gallery alt text"
                disabled={isPending}
                className="flex h-9 w-44 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Add image
              </Button>
            </div>
          )}
        </div>

        {galleryImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gallery images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                <img
                  src={image.urls.thumbnail}
                  alt={typeof image.altText === 'string' ? image.altText : 'Pack gallery image'}
                  className="size-full object-cover"
                />
                {canWrite && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/65 opacity-0 transition-opacity group-hover:opacity-100">
                    {activeImageId === image.id ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          title="Move image earlier"
                          disabled={isPending || index === 0}
                          onClick={() => handleMove(image, -1)}
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          title="Move image later"
                          disabled={isPending || index === galleryImages.length - 1}
                          onClick={() => handleMove(image, 1)}
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          title="Set as cover"
                          disabled={isPending}
                          onClick={() => handlePromote(image)}
                        >
                          <Star className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="size-7"
                          title="Remove image"
                          disabled={isPending}
                          onClick={() => deleteConfirm.open(image)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.setOpen}
        title="Remove pack image?"
        description="This removes the image relationship from the pack through the backend media API."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
      />
    </div>
  )
}
