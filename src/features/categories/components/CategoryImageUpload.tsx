import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useCategoryImageDelete, useCategoryImageReplace } from '../hooks/use-categories'
import { useToast } from '@/shared/hooks/use-toast'
import type { MediaImageResponse } from '@/lib/api'

interface CategoryImageUploadProps {
  categoryId: string
  currentImage?: MediaImageResponse | null
}

export function CategoryImageUpload({ categoryId, currentImage }: CategoryImageUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const replace = useCategoryImageReplace(categoryId)
  const deleteImage = useCategoryImageDelete(categoryId)
  const deleteConfirm = useConfirmDialog()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    const result = await replace.mutate({ file })
    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Image updated', description: 'Category image has been replaced.' })
      setPreviewUrl(null)
    } else {
      toast({ tone: 'error', title: 'Upload failed', description: 'Could not upload the image. Try again.' })
      setPreviewUrl(null)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async () => {
    const result = await deleteImage.mutate()
    deleteConfirm.close()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Image removed', description: 'Category image has been removed.' })
    } else {
      toast({ tone: 'error', title: 'Remove failed', description: 'Could not remove the image. Try again.' })
    }
  }

  const displayUrl = previewUrl ?? currentImage?.urls.card ?? null
  const isPending = replace.isPending || deleteImage.isPending

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Category"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-6 animate-spin text-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isPending}
            aria-label="Upload category image"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {currentImage ? 'Replace image' : 'Upload image'}
          </Button>
          {currentImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => deleteConfirm.open()}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Remove image
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.setOpen}
        title="Remove category image?"
        description="The image will be removed from this category. This cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
        isPending={deleteImage.isPending}
      />
    </div>
  )
}
