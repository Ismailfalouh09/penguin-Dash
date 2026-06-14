import { useRef, useState } from 'react'
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/hooks/use-toast'
import { useReferenceSwatchUpload, useReferenceSwatchDelete } from '../hooks/use-product-references'
import type { MediaImageResponse } from '@/lib/api'

interface ReferenceSwatchUploadProps {
  referenceId: string
  productId: string
  currentImage: MediaImageResponse | null | undefined
  disabled?: boolean
  onImageChange?: () => void
}

/**
 * Swatch image panel: shows current image, allows file replacement, and deletion.
 * Uploads are sent as multipart/form-data via the backend media endpoint.
 * One image per reference is supported by the backend contract.
 */
export function ReferenceSwatchUpload({
  referenceId,
  productId,
  currentImage,
  disabled,
  onImageChange,
}: ReferenceSwatchUploadProps) {
  const { toast } = useToast()
  const uploadMutation = useReferenceSwatchUpload(referenceId, productId)
  const deleteMutation = useReferenceSwatchDelete(referenceId, productId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [altText, setAltText] = useState(
    typeof currentImage?.altText === 'string' ? currentImage.altText : ''
  )

  const isPending = uploadMutation.isPending || deleteMutation.isPending

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await uploadMutation.mutate({
      file,
      ...(altText ? { altText } : {}),
    })

    if (inputRef.current) inputRef.current.value = ''

    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Swatch uploaded', description: 'Reference swatch image updated.' })
      onImageChange?.()
    } else {
      toast({ tone: 'error', title: 'Upload failed', description: 'Could not upload the swatch image. Try again.' })
    }
  }

  const handleDelete = async () => {
    const result = await deleteMutation.mutate()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Swatch removed', description: 'Reference swatch image has been removed.' })
      onImageChange?.()
    } else {
      toast({ tone: 'error', title: 'Remove failed', description: 'Could not remove the swatch image. Try again.' })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-md border border-border bg-muted flex-shrink-0">
          {currentImage ? (
            <img
              src={currentImage.urls.swatch ?? currentImage.urls.thumbnail}
              alt={typeof currentImage.altText === 'string' ? currentImage.altText : 'Reference swatch'}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <label htmlFor="swatch-alt-text" className="text-xs text-muted-foreground">
              Alternative text (optional)
            </label>
            <input
              id="swatch-alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Medium warm shade swatch"
              disabled={disabled || isPending}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          {!disabled && (
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => inputRef.current?.click()}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                {currentImage ? 'Replace swatch' : 'Upload swatch'}
              </Button>

              {currentImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP. Maximum file size: 5 MB. One swatch per reference.
      </p>
    </div>
  )
}
