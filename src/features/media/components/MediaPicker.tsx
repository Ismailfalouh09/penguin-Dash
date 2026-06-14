import { useState, useRef } from 'react'
import { Check, ImageIcon, Loader2, Search, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useMediaList, useMediaUpload, formatBytes, getMediaDisplayName } from '../hooks/use-media'
import { useToast } from '@/shared/hooks/use-toast'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import type { MediaAssetResponse, MediaControllerFindAllParams } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const PAGE_SIZE = 20

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with selected assets when the user confirms. */
  onSelect: (assets: MediaAssetResponse[]) => void
  /** Allow selecting more than one asset. Default: false. */
  multiple?: boolean
  /** Initial selection (assets already selected by the caller). */
  initialSelection?: MediaAssetResponse[]
  /** Whether the current user can upload new images. */
  canUpload?: boolean
}

function MediaThumbnail({
  asset,
  selected,
  onToggle,
}: {
  asset: MediaAssetResponse
  selected: boolean
  onToggle: () => void
}) {
  const name = getMediaDisplayName(asset)
  const fmt = asset.format != null && typeof (asset.format as unknown) === 'string'
    ? (asset.format as unknown as string).toUpperCase()
    : null
  const w = typeof asset.width === 'number' ? asset.width : null
  const h = typeof asset.height === 'number' ? asset.height : null

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`Select ${name}`}
      className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected ? 'border-primary' : 'border-transparent hover:border-border'
      }`}
    >
      <img
        src={asset.urls.thumbnail}
        alt={typeof asset.altText === 'string' ? asset.altText : name}
        className="size-full object-cover"
        loading="lazy"
      />
      {selected && (
        <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" aria-hidden="true" />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 hidden bg-black/60 px-1.5 py-1 group-hover:block">
        <p className="truncate text-xs text-white">{name}</p>
        {fmt && (
          <p className="text-xs text-white/70">
            {fmt}{w && h ? ` · ${w}×${h}` : ''} · {formatBytes(asset.bytes)}
          </p>
        )}
      </div>
    </button>
  )
}

function InlineUpload({ onUploaded, canUpload }: { onUploaded: (asset: MediaAssetResponse) => void; canUpload: boolean }) {
  const { toast } = useToast()
  const upload = useMediaUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  if (!canUpload) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ACCEPTED.includes(file.type)) {
      toast({ tone: 'error', title: 'Invalid file', description: 'Only JPEG, PNG, and WebP are supported.' })
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ tone: 'error', title: 'File too large', description: 'Maximum 10 MB per image.' })
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    const result = await upload.mutate({ file })
    if (inputRef.current) inputRef.current.value = ''

    if (result && result.status === 201) {
      toast({ tone: 'success', title: 'Uploaded', description: 'Image added to the library.' })
      onUploaded(result.data)
    } else {
      toast({ tone: 'error', title: 'Upload failed', description: 'Could not upload the image.' })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="sr-only"
        aria-label="Upload new image"
        onChange={handleFileChange}
        disabled={upload.isPending}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
        Upload new
      </Button>
    </div>
  )
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  initialSelection = [],
  canUpload = false,
}: MediaPickerProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<MediaAssetResponse[]>(initialSelection)

  const debouncedSearch = useDebouncedValue(search, 300)

  const params: MediaControllerFindAllParams = {
    page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }

  const { data, isLoading, isError, refetch } = useMediaList(params)

  const paginatedData = data && 'status' in data && data.status === 200
    ? (data.data as unknown as PaginatedResponse<MediaAssetResponse>)
    : null

  const assets = paginatedData?.data ?? []
  const meta = paginatedData?.meta

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const toggleAsset = (asset: MediaAssetResponse) => {
    setSelection((prev) => {
      const isSelected = prev.some((a) => a.id === asset.id)
      if (isSelected) return prev.filter((a) => a.id !== asset.id)
      if (!multiple) return [asset]
      return [...prev, asset]
    })
  }

  const handleConfirm = () => {
    onSelect(selection)
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearch('')
      setPage(1)
      setSelection(initialSelection)
    }
    onOpenChange(next)
  }

  const handleUploaded = (asset: MediaAssetResponse) => {
    if (!multiple) {
      setSelection([asset])
    } else {
      setSelection((prev) => [asset, ...prev])
    }
    setPage(1)
    setSearch('')
  }

  const totalPages = meta?.totalPages ?? 1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Select image</DialogTitle>
          <DialogDescription>
            {multiple ? 'Select one or more images from the library.' : 'Select an image from the library.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-border px-6 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search media..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search media library"
            />
          </div>
          <InlineUpload canUpload={canUpload} onUploaded={handleUploaded} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Loading media" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">Could not load media library.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <ImageIcon className="size-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No images match your search.' : 'No images in the library yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {assets.map((asset) => (
                <MediaThumbnail
                  key={asset.id}
                  asset={asset}
                  selected={selection.some((s) => s.id === asset.id)}
                  onToggle={() => toggleAsset(asset)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {selection.length > 0 && (
          <div className="border-t border-border bg-muted/30 px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="shrink-0 text-xs text-muted-foreground">Selected:</span>
              {selection.map((a) => (
                <div key={a.id} className="relative shrink-0">
                  <img
                    src={a.urls.thumbnail}
                    alt={typeof a.altText === 'string' ? a.altText : getMediaDisplayName(a)}
                    className="size-10 rounded object-cover ring-1 ring-border"
                  />
                  <button
                    type="button"
                    onClick={() => toggleAsset(a)}
                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-background hover:bg-destructive"
                    aria-label={`Remove ${getMediaDisplayName(a)} from selection`}
                  >
                    <X className="size-2.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selection.length === 0}
          >
            {selection.length > 0
              ? `Select ${selection.length} image${selection.length > 1 ? 's' : ''}`
              : 'Select'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
