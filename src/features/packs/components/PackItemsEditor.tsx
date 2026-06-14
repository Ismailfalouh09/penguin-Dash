import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { usePackProductOptions } from '../hooks/use-packs'
import { PackItemInputDtoSelectionMode } from '@/lib/api/generated/models/packItemInputDtoSelectionMode'
import type {
  PackItemInputDto,
  PackItemInputDtoProductReferenceId,
  PackItemResponse,
  ProductResponse,
} from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const SELECTION_MODE_LABELS: Record<string, string> = {
  FIXED_REFERENCE: 'Fixed reference',
  AUTO_BEST_REFERENCE: 'Automatic best reference',
  CUSTOMER_CHOICE: 'Customer choice',
}

interface PackItemsEditorProps {
  value: PackItemInputDto[]
  onChange: (items: PackItemInputDto[]) => void
  disabled?: boolean
  error?: string | null
}

function createEmptyItem(sortOrder: number): PackItemInputDto {
  return {
    productId: '',
    selectionMode: PackItemInputDtoSelectionMode.AUTO_BEST_REFERENCE,
    quantity: 1,
    isRequired: true,
    sortOrder,
  }
}

export function PackItemsEditor({ value, onChange, disabled, error }: PackItemsEditorProps) {
  const productsQuery = usePackProductOptions({
    page: 1,
    pageSize: 100,
    status: 'ACTIVE',
    isActive: true,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  const rawProducts =
    productsQuery.data?.status === 200
      ? (productsQuery.data.data as unknown as PaginatedResponse<ProductResponse>)
      : null
  const products = rawProducts?.data ?? []

  const updateItem = (index: number, patch: Partial<PackItemInputDto>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })))
  }

  if (productsQuery.isLoading) {
    return <LoadingState label="Loading products..." />
  }

  if (productsQuery.isError) {
    return (
      <ErrorState
        message="Could not load product options."
        onRetry={() => productsQuery.refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pack items added yet.</p>
      ) : (
        <div className="space-y-3">
          {value.map((item, index) => {
            const selectedProduct =
              products.find((product) => product.id === item.productId) ?? null
            const references =
              selectedProduct?.references?.filter((reference) => reference.isActive) ?? []
            const requiresReference =
              item.selectionMode === PackItemInputDtoSelectionMode.FIXED_REFERENCE

            return (
              <div
                key={`${item.productId}-${index}`}
                className="rounded-md border border-border p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Item {index + 1}</p>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs text-muted-foreground"
                      htmlFor={`pack-item-product-${index}`}
                    >
                      Product
                    </label>
                    <Select
                      value={item.productId}
                      onValueChange={(productId) =>
                        updateItem(index, {
                          productId,
                          productReferenceId: undefined,
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger id={`pack-item-product-${index}`}>
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label
                      className="text-xs text-muted-foreground"
                      htmlFor={`pack-item-mode-${index}`}
                    >
                      Reference selection
                    </label>
                    <Select
                      value={item.selectionMode}
                      onValueChange={(selectionMode) =>
                        updateItem(index, {
                          selectionMode: selectionMode as PackItemInputDto['selectionMode'],
                          productReferenceId:
                            selectionMode === PackItemInputDtoSelectionMode.FIXED_REFERENCE
                              ? item.productReferenceId
                              : undefined,
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger id={`pack-item-mode-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PackItemInputDtoSelectionMode).map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {SELECTION_MODE_LABELS[mode] ?? mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {requiresReference && (
                    <div className="space-y-1 lg:col-span-2">
                      <label
                        className="text-xs text-muted-foreground"
                        htmlFor={`pack-item-reference-${index}`}
                      >
                        Fixed reference
                      </label>
                      <Select
                        value={
                          typeof item.productReferenceId === 'string' ? item.productReferenceId : ''
                        }
                        onValueChange={(productReferenceId) =>
                          updateItem(index, {
                            productReferenceId:
                              productReferenceId as unknown as PackItemInputDtoProductReferenceId,
                          })
                        }
                        disabled={disabled || !selectedProduct || references.length === 0}
                      >
                        <SelectTrigger id={`pack-item-reference-${index}`}>
                          <SelectValue
                            placeholder={
                              selectedProduct
                                ? references.length === 0
                                  ? 'No active references'
                                  : 'Select reference...'
                                : 'Select product first'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {references.map((reference) => (
                            <SelectItem key={reference.id} value={reference.id}>
                              {reference.referenceCode} - {reference.referenceName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!requiresReference && (
                    <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground lg:col-span-2">
                      {item.selectionMode === PackItemInputDtoSelectionMode.AUTO_BEST_REFERENCE
                        ? 'The recommendation engine selects the best active reference later.'
                        : 'The customer-facing flow can choose the reference later; no fixed reference is submitted.'}
                    </p>
                  )}

                  <div className="space-y-1">
                    <label
                      className="text-xs text-muted-foreground"
                      htmlFor={`pack-item-quantity-${index}`}
                    >
                      Quantity
                    </label>
                    <input
                      id={`pack-item-quantity-${index}`}
                      type="number"
                      min={1}
                      step={1}
                      value={item.quantity ?? 1}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                        })
                      }
                      disabled={disabled}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      className="text-xs text-muted-foreground"
                      htmlFor={`pack-item-sort-${index}`}
                    >
                      Sort order
                    </label>
                    <input
                      id={`pack-item-sort-${index}`}
                      type="number"
                      min={0}
                      step={1}
                      value={item.sortOrder ?? index}
                      onChange={(event) =>
                        updateItem(index, {
                          sortOrder: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                        })
                      }
                      disabled={disabled}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.isRequired ?? true}
                    onChange={(event) => updateItem(index, { isRequired: event.target.checked })}
                    disabled={disabled}
                    className="size-4 rounded border border-border accent-primary"
                  />
                  Required item
                </label>
              </div>
            )
          })}
        </div>
      )}

      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, createEmptyItem(value.length)])}
        >
          <Plus className="size-4" />
          Add item
        </Button>
      )}
    </div>
  )
}

export function PackItemsDisplay({ items }: { items: PackItemResponse[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No pack items configured.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">
                Quantity {item.quantity} -{' '}
                {SELECTION_MODE_LABELS[item.selectionMode] ?? item.selectionMode}
              </p>
              {item.productReference ? (
                <p className="mt-1 text-sm">
                  Fixed reference:{' '}
                  <span className="font-mono">{item.productReference.referenceCode}</span>{' '}
                  {item.productReference.referenceName}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Reference is selected later by the configured mode.
                </p>
              )}
            </div>
            <StatusBadge tone={item.isRequired ? 'info' : 'neutral'} withDot={false}>
              {item.isRequired ? 'Required' : 'Optional'}
            </StatusBadge>
          </div>
        </div>
      ))}
    </div>
  )
}
