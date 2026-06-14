import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Trash2, Upload, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import {
  useProductImageUpload,
  useProductImageDelete,
} from '../hooks/use-products'
import { productMediaControllerUpdate } from '@/lib/api/generated/endpoints/admin-product-media/admin-product-media'
import { useQueryClient } from '@tanstack/react-query'
import { getAdminProductsControllerFindOneQueryKey } from '@/lib/api/generated/endpoints/admin-products/admin-products'
import type { MediaImageResponse } from '@/lib/api'

interface ProductGalleryProps {
  productId: string
  coverImage?: MediaImageResponse | null
  images: MediaImageResponse[]
  canWrite: boolean
}

export function ProductGallery({ productId, coverImage, images, canWrite }: ProductGalleryProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [promotingId, setPromotingId] = useState<string | null>(null)

  const uploadHook = useProductImageUpload(productId)
  const deleteHook = useProductImageDelete(productId)
  const deleteConfirm = useConfirmDialog<MediaImageResponse>()

  const galleryImages = images.filter((img) => img.role === 'GALLERY')

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadHook.mutate({ file, role: 'COVER' })
    if (coverInputRef.current) coverInputRef.current.value = ''
    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Cover updated', description: 'The cover image has been set.' })
    } else {
      toast({ tone: 'error', title: 'Upload failed', description: 'Could not upload the cover image.' })
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadHook.mutate({ file, role: 'GALLERY' })
    if (galleryInputRef.current) galleryInputRef.current.value = ''
    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Image added', description: 'Gallery image has been added.' })
    } else {
      toast({ tone: 'error', title: 'Upload failed', description: 'Could not upload the gallery image.' })
    }
  }

  const handleDeleteConfirm = async () => {
    const target = deleteConfirm.target
    if (!target) return
    const result = await deleteHook.mutate(target.id)
    deleteConfirm.close()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Image removed', description: 'The image has been removed.' })
    } else {
      toast({ tone: 'error', title: 'Remove failed', description: 'Could not remove the image.' })
    }
  }

  const handlePromoteToCover = async (image: MediaImageResponse) => {
    setPromotingId(image.id)
    try {
      const result = await productMediaControllerUpdate(productId, image.id, { role: 'COVER' })
      if (result.status === 200) {
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        toast({ tone: 'success', title: 'Cover set', description: 'This image is now the cover.' })
      } else {
        toast({ tone: 'error', title: 'Failed', description: 'Could not set this image as cover.' })
      }
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cover image */}
      <div>
        <h3 className="text-sm font-medium mb-3">Cover image</h3>
        <div className="flex items-start gap-4">
          <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {coverImage ? (
              <img
                src={coverImage.urls.card}
                alt="Product cover"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            {uploadHook.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
          </div>

          {canWrite && (
            <div className="flex flex-col gap-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleCoverUpload}
                disabled={uploadHook.isPending}
                aria-label="Upload cover image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadHook.isPending}
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
                  disabled={deleteHook.isPending}
                  onClick={() => deleteConfirm.open(coverImage)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove cover
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Gallery</h3>
          {canWrite && (
            <>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleGalleryUpload}
                disabled={uploadHook.isPending}
                aria-label="Add gallery image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadHook.isPending}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Add image
              </Button>
            </>
          )}
        </div>

        {galleryImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gallery images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {galleryImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={img.urls.thumbnail}
                  alt={typeof img.altText === 'string' ? img.altText : 'Gallery image'}
                  className="size-full object-cover"
                />
                {canWrite && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {promotingId === img.id ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        title="Set as cover"
                        onClick={() => handlePromoteToCover(img)}
                        disabled={deleteHook.isPending}
                      >
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="size-7"
                      title="Remove image"
                      onClick={() => deleteConfirm.open(img)}
                      disabled={deleteHook.isPending || promotingId === img.id}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
        title="Remove image?"
        description="This image will be permanently deleted from this product."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDeleteConfirm}
        isPending={deleteHook.isPending}
      />
    </div>
  )
}
