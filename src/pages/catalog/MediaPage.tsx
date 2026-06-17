import { useState } from 'react'
import {
  ImageIcon,
  Upload,
  Trash2,
  Eye,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useToast } from '@/shared/hooks/use-toast'
import { useMediaList, useMediaDelete, formatBytes, getMediaDisplayName } from '@/features/media/hooks/use-media'
import { MediaUploadDialog } from '@/features/media/components/MediaUploadDialog'
import { MediaDetailSheet } from '@/features/media/components/MediaDetailSheet'
import { useCurrentUser } from '@/features/auth/current-user'
import type { MediaAssetResponse, MediaControllerFindAllParams } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'
import type { MediaControllerFindAllSortBy } from '@/lib/api/generated/models/mediaControllerFindAllSortBy'
import type { MediaControllerFindAllSortOrder } from '@/lib/api/generated/models/mediaControllerFindAllSortOrder'

const SORT_OPTIONS: { value: MediaControllerFindAllSortBy; label: string }[] = [
  { value: 'createdAt', label: 'Date added' },
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'bytes', label: 'File size' },
  { value: 'originalName', label: 'Name' },
]

function MediaCard({
  asset,
  canWrite,
  onView,
  onDelete,
}: {
  asset: MediaAssetResponse
  canWrite: boolean
  onView: () => void
  onDelete: () => void
}) {
  const name = getMediaDisplayName(asset)
  const fmt = asset.format != null && typeof (asset.format as unknown) === 'string'
    ? (asset.format as unknown as string).toUpperCase()
    : null
  const w = typeof asset.width === 'number' ? asset.width : null
  const h = typeof asset.height === 'number' ? asset.height : null

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={asset.urls.thumbnail}
          alt={typeof asset.altText === 'string' ? asset.altText : name}
          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {asset.isDeleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium text-white">
              Deleted
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8"
            aria-label={`View details for ${name}`}
            onClick={onView}
          >
            <Eye className="size-4" aria-hidden="true" />
          </Button>
          {canWrite && !asset.isDeleted && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="size-8"
              aria-label={`Archive ${name}`}
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-foreground" title={name}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {[fmt, w && h ? `${w}×${h}` : null, formatBytes(asset.bytes)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(asset.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export function MediaPage() {
  const { can } = useCurrentUser()
  const canWrite = can('media:manage')
  const { toast } = useToast()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailAssetId, setDetailAssetId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const deleteConfirm = useConfirmDialog<MediaAssetResponse>()
  const deleteMedia = useMediaDelete()

  const listState = useListQueryState({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
  })

  const includeDeleted = listState.filters['includeDeleted'] === 'true'

  const params: MediaControllerFindAllParams = {
    page: listState.page,
    pageSize: listState.limit,
    ...(listState.search ? { search: listState.search } : {}),
    ...(listState.sortBy ? { sortBy: listState.sortBy as MediaControllerFindAllSortBy } : {}),
    sortOrder: listState.sortOrder as MediaControllerFindAllSortOrder,
    includeDeleted,
  }

  const { data, isLoading, isError, refetch } = useMediaList(params)

  const paginatedData =
    data && 'status' in data && data.status === 200
      ? (data.data as unknown as PaginatedResponse<MediaAssetResponse>)
      : null

  const assets = paginatedData?.data ?? []
  const meta = paginatedData?.meta

  const handleDelete = async () => {
    const target = deleteConfirm.target
    if (!target) return
    const result = await deleteMedia.mutate(target.id)
    deleteConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Asset archived',
        description: 'The media asset has been soft-deleted. Existing entity references remain intact.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Archive failed',
        description: 'Could not archive the media asset. Try again.',
      })
    }
  }

  const openDetail = (id: string) => {
    setDetailAssetId(id)
    setDetailOpen(true)
  }

  const toggleSort = (col: MediaControllerFindAllSortBy) => {
    if (listState.sortBy === col) {
      listState.setState({ sortOrder: listState.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      listState.setState({ sortBy: col, sortOrder: 'desc' })
    }
  }

  const SortIcon = listState.sortOrder === 'asc' ? SortAsc : SortDesc

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Media library"
          description="Browse and manage catalog imagery."
          actions={
            <PermissionGuard permission="media:manage">
              <Button type="button" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" aria-hidden="true" />
                Upload image
              </Button>
            </PermissionGuard>
          }
        />

        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-48 flex-1">
              <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={listState.search}
                onChange={(e) => listState.setSearch(e.target.value)}
                placeholder="Search media..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Search media"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) =>
                  listState.setFilter('includeDeleted', e.target.checked ? 'true' : null)
                }
                className="size-4 rounded border-border"
              />
              Show archived
            </label>

            {listState.hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={listState.clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={listState.sortBy === opt.value ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleSort(opt.value)}
                aria-pressed={listState.sortBy === opt.value}
              >
                {opt.label}
                {listState.sortBy === opt.value && (
                  <SortIcon className="ml-1 size-3.5" aria-hidden="true" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <LoadingState variant="cards" label="Loading media assets…" />
        ) : isError ? (
          <ErrorState
            title="Could not load media"
            message="The media library could not be retrieved. Please try again."
            onRetry={() => refetch()}
          />
        ) : assets.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={listState.hasActiveFilters ? 'No media matches your filters' : 'No media yet'}
            description={
              listState.hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Upload an image to get started.'
            }
            action={
              canWrite && !listState.hasActiveFilters ? (
                <Button type="button" onClick={() => setUploadOpen(true)}>
                  <Upload className="size-4" />
                  Upload image
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {assets.map((asset) => (
                <MediaCard
                  key={asset.id}
                  asset={asset}
                  canWrite={canWrite}
                  onView={() => openDetail(asset.id)}
                  onDelete={() => deleteConfirm.open(asset)}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  {meta.totalItems} asset{meta.totalItems !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasPreviousPage || isLoading}
                    onClick={() => listState.setPage(listState.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasNextPage || isLoading}
                    onClick={() => listState.setPage(listState.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <MediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => refetch()}
      />

      <MediaDetailSheet
        assetId={detailAssetId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canWrite={canWrite}
      />

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.setOpen}
        title="Archive media asset?"
        description={
          <span>
            This soft-deletes the asset from the library. The Cloudinary image will be removed, but{' '}
            <strong>existing entity references will remain intact</strong> and will not be affected.
            This action cannot be undone from the admin panel.
          </span>
        }
        confirmLabel="Archive"
        destructive
        onConfirm={handleDelete}
        isPending={deleteMedia.isPending}
      />
    </PageContainer>
  )
}
