import { useState, useEffect } from 'react'
import { ExternalLink, Loader2, Info } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { useMediaDetail, useMediaUpdate, formatBytes, getMediaDisplayName } from '../hooks/use-media'
import { useToast } from '@/shared/hooks/use-toast'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import type { MediaAssetResponse } from '@/lib/api'

interface MediaDetailSheetProps {
  assetId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canWrite: boolean
  onDeleted?: (id: string) => void
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-1.5 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all text-foreground">{value ?? '—'}</span>
    </div>
  )
}

function DetailContent({
  asset,
  canWrite,
}: {
  asset: MediaAssetResponse
  canWrite: boolean
}) {
  const { toast } = useToast()
  const update = useMediaUpdate(asset.id)
  const [altText, setAltText] = useState(
    typeof asset.altText === 'string' ? asset.altText : ''
  )
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setAltText(typeof asset.altText === 'string' ? asset.altText : '')
    setDirty(false)
  }, [asset.id, asset.altText])

  const handleSave = async () => {
    const result = await update.mutate({ altText: altText || null })
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Metadata saved', description: 'Alt text updated.' })
      setDirty(false)
    } else {
      toast({ tone: 'error', title: 'Save failed', description: 'Could not update metadata.' })
    }
  }

  const displayName = getMediaDisplayName(asset)
  const w = typeof asset.width === 'number' ? asset.width : null
  const h = typeof asset.height === 'number' ? asset.height : null
  const fmt = asset.format != null && typeof (asset.format as unknown) === 'string'
    ? (asset.format as unknown as string).toUpperCase()
    : null

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4">
        <img
          src={asset.urls.detail}
          alt={typeof asset.altText === 'string' ? asset.altText : displayName}
          className="max-h-64 max-w-full rounded object-contain"
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        <MetaRow label="Name" value={displayName} />
        <MetaRow label="Format" value={fmt} />
        <MetaRow
          label="Dimensions"
          value={w && h ? `${w} × ${h} px` : null}
        />
        <MetaRow label="Size" value={formatBytes(asset.bytes)} />
        <MetaRow
          label="Created"
          value={new Date(asset.createdAt).toLocaleString()}
        />
        <MetaRow
          label="Updated"
          value={new Date(asset.updatedAt).toLocaleString()}
        />
        {asset.usageContext && (
          <MetaRow label="Usage" value={String(asset.usageContext)} />
        )}
        {asset.relatedEntity && (
          <MetaRow label="Entity" value={String(asset.relatedEntity)} />
        )}
        {asset.uploadedByAdmin && (
          <MetaRow
            label="Uploaded by"
            value={asset.uploadedByAdmin.fullName}
          />
        )}
        <div className="flex gap-2 py-1.5 text-sm">
          <span className="w-28 shrink-0 text-muted-foreground">Original URL</span>
          <a
            href={asset.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 truncate text-primary underline-offset-2 hover:underline"
          >
            Open <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      {asset.isDeleted && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          This asset has been soft-deleted. It may still appear in existing entity records.
        </div>
      )}

      {canWrite && !asset.isDeleted && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Metadata updates change only local records — the Cloudinary asset is not replaced.
          </p>
          <label htmlFor="detail-alt-text" className="text-sm font-medium text-foreground">
            Alt text
          </label>
          <input
            id="detail-alt-text"
            type="text"
            value={altText}
            onChange={(e) => {
              setAltText(e.target.value)
              setDirty(true)
            }}
            placeholder="Describe the image"
            disabled={update.isPending}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
          {dirty && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={update.isPending}
            >
              {update.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Save metadata
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function MediaDetailSheet({
  assetId,
  open,
  onOpenChange,
  canWrite,
}: MediaDetailSheetProps) {
  const { data, isLoading, isError, refetch } = useMediaDetail(assetId ?? '')

  const asset =
    data && 'status' in data && data.status === 200 ? (data.data as MediaAssetResponse) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Media details</SheetTitle>
          <SheetDescription>View and edit asset metadata.</SheetDescription>
        </SheetHeader>

        {!assetId || isLoading ? (
          <LoadingState />
        ) : isError || !asset ? (
          <ErrorState
            title="Could not load asset"
            message="The media asset could not be retrieved."
            onRetry={() => refetch()}
          />
        ) : (
          <DetailContent
            asset={asset}
            canWrite={canWrite}
          />
        )}

        <SheetFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
