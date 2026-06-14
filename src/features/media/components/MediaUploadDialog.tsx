import { useRef, useState } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useMediaUpload } from '../hooks/use-media'
import { useToast } from '@/shared/hooks/use-toast'
import type { MediaAssetResponse } from '@/lib/api'

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp'
const MAX_BYTES = 10 * 1024 * 1024

interface MediaUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded?: (asset: MediaAssetResponse) => void
}

export function MediaUploadDialog({ open, onOpenChange, onUploaded }: MediaUploadDialogProps) {
  const { toast } = useToast()
  const upload = useMediaUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setAltText('')
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ACCEPTED_MIME.includes(selected.type)) {
      setValidationError('Only JPEG, PNG, and WebP images are supported.')
      setFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }
    if (selected.size > MAX_BYTES) {
      setValidationError(`File is too large. Maximum size is ${MAX_BYTES / 1024 / 1024} MB.`)
      setFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }

    setValidationError(null)
    setFile(selected)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) return

    const result = await upload.mutate({
      file,
      ...(altText ? { altText } : {}),
    })

    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Image uploaded', description: 'Media asset added to the library.' })
      onUploaded?.(result.data)
      handleOpenChange(false)
    } else {
      const status = result?.status
      let msg = 'Could not upload the image. Try again.'
      if (status === 413) msg = 'The file is too large for the server.'
      else if (status === 415) msg = 'Unsupported image format.'
      else if (status === 503) msg = 'Storage service is unavailable.'
      toast({ tone: 'error', title: 'Upload failed', description: msg })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
          <DialogDescription>
            Supported formats: JPEG, PNG, WebP. Maximum 10 MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-ring hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full rounded object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <ImageIcon className="size-10 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Click to select an image</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="sr-only"
            aria-label="Select image file"
            onChange={handleFileChange}
            disabled={upload.isPending}
          />

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}

          {file && (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="truncate text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={reset}
                className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Remove selected file"
                disabled={upload.isPending}
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="upload-alt-text" className="text-sm font-medium text-foreground">
              Alt text (optional)
            </label>
            <input
              id="upload-alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              disabled={upload.isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={upload.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || !!validationError || upload.isPending}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
