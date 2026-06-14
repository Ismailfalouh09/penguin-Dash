import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Form,
  FormActions,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLayout,
  FormMessage,
  FormSection,
} from '@/shared/components/forms'
import { useUnsavedChangesWarning } from '@/shared/hooks/use-unsaved-changes-warning'
import { PackCompatibilityEditor } from './PackCompatibilityEditor'
import { PackItemsEditor } from './PackItemsEditor'
import { usePackAttributeGroups } from '../hooks/use-packs'
import { ROUTES } from '@/config/routes'
import { CreatePackDtoPriceMode } from '@/lib/api/generated/models/createPackDtoPriceMode'
import { CreatePackDtoStatus } from '@/lib/api/generated/models/createPackDtoStatus'
import { PackItemInputDtoSelectionMode } from '@/lib/api/generated/models/packItemInputDtoSelectionMode'
import type {
  AttributeGroupResponse,
  CreatePackDto,
  PackAttributeInputDto,
  PackItemInputDto,
  PackResponse,
} from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const packSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().optional(),
  priceMode: z.nativeEnum(CreatePackDtoPriceMode),
  fixedPrice: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  priority: z.number().int().nonnegative(),
  status: z.nativeEnum(CreatePackDtoStatus),
  isActive: z.boolean(),
})

type PackFormValues = z.infer<typeof packSchema>

interface PackFormProps {
  mode: 'create' | 'edit'
  defaultValues?: PackResponse
  onSubmit: (dto: CreatePackDto) => Promise<void>
  isSubmitting: boolean
}

type PackFormLegacyDefaults = Partial<{
  description: string
  discountAmount: number
  discountPercentage: number
  minBudget: number
  maxBudget: number
  currency: string
  priority: number
}>

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function numberOrUndefined(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) ? value : undefined
}

function priceFromUnknown(value: unknown) {
  return typeof value === 'number' ? value : 0
}

export function PackForm({ mode, defaultValues, onSubmit, isSubmitting }: PackFormProps) {
  const navigate = useNavigate()
  const groupsQuery = usePackAttributeGroups()
  const legacyDefaults = defaultValues as unknown as PackFormLegacyDefaults | undefined
  const validGroupCodes = new Set(
    groupsQuery.data?.status === 200
      ? (groupsQuery.data.data as unknown as PaginatedResponse<AttributeGroupResponse>).data.map(
          (g) => g.code
        )
      : []
  )
  const [items, setItems] = useState<PackItemInputDto[]>(() =>
    (defaultValues?.items ?? []).map((item, index) => ({
      productId: item.product.id,
      productReferenceId: item.productReference?.id as PackItemInputDto['productReferenceId'],
      selectionMode: item.selectionMode as PackItemInputDto['selectionMode'],
      quantity: item.quantity,
      isRequired: item.isRequired,
      sortOrder: index,
    }))
  )
  const [attributes, setAttributes] = useState<PackAttributeInputDto[]>(() =>
    (defaultValues?.attributes ?? []).map((attribute) => ({
      attributeGroupCode: attribute.attributeGroup.code,
      attributeOptionCode: attribute.attributeOption.code,
      matchType: attribute.matchType as PackAttributeInputDto['matchType'],
      scoreValue: attribute.scoreValue,
      isHardFilter: attribute.isHardFilter,
    }))
  )
  const [itemError, setItemError] = useState<string | null>(null)

  const form = useForm<PackFormValues>({
    resolver: zodResolver(packSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      description:
        typeof legacyDefaults?.description === 'string' ? legacyDefaults.description : '',
      priceMode: (defaultValues?.priceMode ??
        CreatePackDtoPriceMode.SUM_ITEMS) as PackFormValues['priceMode'],
      fixedPrice: priceFromUnknown(defaultValues?.fixedPrice),
      discountAmount:
        typeof legacyDefaults?.discountAmount === 'number' ? legacyDefaults.discountAmount : 0,
      discountPercentage:
        typeof legacyDefaults?.discountPercentage === 'number'
          ? legacyDefaults.discountPercentage
          : 0,
      minBudget: typeof legacyDefaults?.minBudget === 'number' ? legacyDefaults.minBudget : 0,
      maxBudget: typeof legacyDefaults?.maxBudget === 'number' ? legacyDefaults.maxBudget : 0,
      currency: typeof legacyDefaults?.currency === 'string' ? legacyDefaults.currency : 'MAD',
      priority: typeof legacyDefaults?.priority === 'number' ? legacyDefaults.priority : 0,
      status: (defaultValues?.status ?? CreatePackDtoStatus.DRAFT) as PackFormValues['status'],
      isActive: defaultValues?.isActive ?? true,
    },
  })

  useUnsavedChangesWarning(form.formState.isDirty && !form.formState.isSubmitting)

  const validateItems = (status: PackFormValues['status']) => {
    if (status === CreatePackDtoStatus.ACTIVE && items.length === 0) {
      return 'Active packs need at least one item.'
    }

    for (const [index, item] of items.entries()) {
      if (!item.productId) return `Item ${index + 1}: select a product.`
      if ((item.quantity ?? 0) < 1) return `Item ${index + 1}: quantity must be at least 1.`
      if (
        item.selectionMode === PackItemInputDtoSelectionMode.FIXED_REFERENCE &&
        typeof item.productReferenceId !== 'string'
      ) {
        return `Item ${index + 1}: select a fixed reference.`
      }
    }

    return null
  }

  const handleSubmit = async (values: PackFormValues) => {
    const nestedError = validateItems(values.status)
    setItemError(nestedError)
    if (nestedError) return

    if (
      values.priceMode === CreatePackDtoPriceMode.FIXED &&
      (!values.fixedPrice || values.fixedPrice <= 0)
    ) {
      form.setError('fixedPrice', { message: 'Fixed price is required for fixed-price packs.' })
      return
    }

    if (
      values.priceMode === CreatePackDtoPriceMode.SUM_ITEMS_WITH_DISCOUNT &&
      (values.discountAmount ?? 0) <= 0 &&
      (values.discountPercentage ?? 0) <= 0
    ) {
      form.setError('discountAmount', { message: 'Set a discount amount or percentage.' })
      return
    }

    const normalizedItems = items.map((item, index) => ({
      productId: item.productId,
      selectionMode: item.selectionMode,
      quantity: item.quantity ?? 1,
      isRequired: item.isRequired ?? true,
      sortOrder: item.sortOrder ?? index,
      ...(item.selectionMode === PackItemInputDtoSelectionMode.FIXED_REFERENCE &&
      typeof item.productReferenceId === 'string'
        ? { productReferenceId: item.productReferenceId }
        : {}),
    }))

    const dto: CreatePackDto = {
      name: values.name,
      slug: values.slug,
      ...(values.description
        ? { description: values.description as unknown as CreatePackDto['description'] }
        : {}),
      priceMode: values.priceMode,
      ...(values.priceMode === CreatePackDtoPriceMode.FIXED && values.fixedPrice !== undefined
        ? { fixedPrice: values.fixedPrice as unknown as CreatePackDto['fixedPrice'] }
        : {}),
      ...(values.priceMode === CreatePackDtoPriceMode.SUM_ITEMS_WITH_DISCOUNT &&
      (values.discountAmount ?? 0) > 0
        ? { discountAmount: values.discountAmount as unknown as CreatePackDto['discountAmount'] }
        : {}),
      ...(values.priceMode === CreatePackDtoPriceMode.SUM_ITEMS_WITH_DISCOUNT &&
      (values.discountPercentage ?? 0) > 0
        ? {
            discountPercentage:
              values.discountPercentage as unknown as CreatePackDto['discountPercentage'],
          }
        : {}),
      ...(numberOrUndefined(values.minBudget) !== undefined && (values.minBudget ?? 0) > 0
        ? { minBudget: values.minBudget as unknown as CreatePackDto['minBudget'] }
        : {}),
      ...(numberOrUndefined(values.maxBudget) !== undefined && (values.maxBudget ?? 0) > 0
        ? { maxBudget: values.maxBudget as unknown as CreatePackDto['maxBudget'] }
        : {}),
      currency: values.currency,
      priority: values.priority,
      status: values.status,
      isActive: values.isActive,
      ...(normalizedItems.length > 0 ? { items: normalizedItems } : {}),
      ...(attributes.length > 0
        ? {
            attributes:
              validGroupCodes.size > 0
                ? attributes.filter((a) => validGroupCodes.has(a.attributeGroupCode))
                : attributes,
          }
        : {}),
    }

    await onSubmit(dto)
  }

  const watchedName = form.watch('name')
  const watchedPriceMode = form.watch('priceMode')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Identity">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      onBlur={(event) => {
                        field.onBlur()
                        if (mode === 'create' && !form.getValues('slug')) {
                          form.setValue('slug', slugify(event.target.value), { shouldDirty: true })
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder={watchedName ? slugify(watchedName) : 'pack-slug'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                      className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priceMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price mode</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CreatePackDtoPriceMode).map((modeValue) => (
                          <SelectItem key={modeValue} value={modeValue}>
                            {modeValue.split('_').join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} maxLength={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchedPriceMode === CreatePackDtoPriceMode.FIXED && (
              <FormField
                control={form.control}
                name="fixedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(event) =>
                          field.onChange(Number.parseFloat(event.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedPriceMode === CreatePackDtoPriceMode.SUM_ITEMS_WITH_DISCOUNT && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={field.value ?? 0}
                          onChange={(event) =>
                            field.onChange(Number.parseFloat(event.target.value) || 0)
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={field.value ?? 0}
                          onChange={(event) =>
                            field.onChange(Number.parseFloat(event.target.value) || 0)
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(event) =>
                          field.onChange(Number.parseFloat(event.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(event) =>
                          field.onChange(Number.parseFloat(event.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Prices shown here are configuration inputs. The backend remains the pricing authority.
            </p>
          </FormSection>

          <FormSection title="Publishing">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CreatePackDtoStatus).map((statusValue) => (
                          <SelectItem key={statusValue} value={statusValue}>
                            {statusValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? 0}
                        onChange={(event) =>
                          field.onChange(Number.parseInt(event.target.value, 10) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    Active
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Pack items">
            <PackItemsEditor
              value={items}
              onChange={setItems}
              disabled={isSubmitting}
              error={itemError}
            />
          </FormSection>

          <FormSection title="Compatibility attributes">
            <PackCompatibilityEditor
              value={attributes}
              onChange={setAttributes}
              disabled={isSubmitting}
            />
          </FormSection>

          <FormActions
            submitLabel={mode === 'create' ? 'Create pack' : 'Save changes'}
            onCancel={() => navigate(defaultValues ? ROUTES.pack(defaultValues.id) : ROUTES.packs)}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
