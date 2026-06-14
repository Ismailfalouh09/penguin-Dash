import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { FormLayout } from '@/shared/components/forms/FormLayout'
import { FormSection } from '@/shared/components/forms/FormSection'
import { FormActions } from '@/shared/components/forms/FormActions'
import { CompatibilityEditor } from './CompatibilityEditor'
import { ROUTES } from '@/config/routes'
import type { ProductReferenceResponse, CreateProductReferenceDto, ReferenceAttributeInputDto } from '@/lib/api'

const referenceSchema = z.object({
  referenceCode: z.string().min(1, 'Reference code is required').max(50),
  referenceName: z.string().min(1, 'Reference name is required').max(200),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  priceDelta: z
    .number({ invalid_type_error: 'Price delta must be a number' })
    .default(0),
  stockQuantity: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .nonnegative('Stock cannot be negative')
    .optional(),
  reservedQuantity: z
    .number({ invalid_type_error: 'Reserved must be a number' })
    .int()
    .nonnegative()
    .optional(),
  lowStockThreshold: z
    .number({ invalid_type_error: 'Threshold must be a number' })
    .int()
    .nonnegative()
    .optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

type ReferenceFormValues = z.infer<typeof referenceSchema>

interface ReferenceFormProps {
  defaultValues?: Partial<ProductReferenceResponse>
  onSubmit: (data: CreateProductReferenceDto) => Promise<void>
  isSubmitting: boolean
  mode: 'create' | 'edit'
  productId: string
}

export function ReferenceForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  mode,
  productId,
}: ReferenceFormProps) {
  const navigate = useNavigate()
  const [attributes, setAttributes] = useState<ReferenceAttributeInputDto[]>(
    () =>
      (defaultValues?.attributes ?? []).map((attr) => ({
        attributeGroupCode: attr.attributeGroup.code,
        attributeOptionCode: attr.attributeOption.code,
        matchType: attr.matchType as ReferenceAttributeInputDto['matchType'],
        scoreValue: attr.scoreValue,
        isHardFilter: attr.isHardFilter,
      }))
  )

  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      referenceCode: defaultValues?.referenceCode ?? '',
      referenceName: defaultValues?.referenceName ?? '',
      sku: typeof defaultValues?.sku === 'string' ? defaultValues.sku : '',
      barcode: typeof defaultValues?.barcode === 'string' ? defaultValues.barcode : '',
      priceDelta: defaultValues?.priceDelta ?? 0,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
      reservedQuantity: defaultValues?.reservedQuantity ?? 0,
      lowStockThreshold: 5,
      isDefault: defaultValues ? false : false,
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: ReferenceFormValues) => {
    const dto: CreateProductReferenceDto = {
      referenceCode: values.referenceCode,
      referenceName: values.referenceName,
      // The orval-generated nullable types for sku/barcode are opaque objects;
      // cast the string through unknown to satisfy the type without modifying generated files.
      ...(values.sku ? { sku: values.sku as unknown as import('@/lib/api').CreateProductReferenceDtoSku } : {}),
      ...(values.barcode ? { barcode: values.barcode as unknown as import('@/lib/api').CreateProductReferenceDtoBarcode } : {}),
      priceDelta: values.priceDelta,
      ...(values.stockQuantity !== undefined ? { stockQuantity: values.stockQuantity } : {}),
      ...(values.reservedQuantity !== undefined ? { reservedQuantity: values.reservedQuantity } : {}),
      ...(values.lowStockThreshold !== undefined ? { lowStockThreshold: values.lowStockThreshold } : {}),
      isDefault: values.isDefault,
      isActive: values.isActive,
      attributes: attributes.length > 0 ? attributes : undefined,
    }
    await onSubmit(dto)
  }

  const isCodeImmutable = mode === 'edit'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Identity" description="Code and display name for this variant.">
            <FormField
              control={form.control}
              name="referenceCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reference code{' '}
                    {!isCodeImmutable && (
                      <span aria-hidden="true" className="text-destructive">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. RF-001"
                      autoComplete="off"
                      disabled={isSubmitting || isCodeImmutable}
                      readOnly={isCodeImmutable}
                      aria-describedby={isCodeImmutable ? 'code-immutable-note' : undefined}
                    />
                  </FormControl>
                  {isCodeImmutable && (
                    <p id="code-immutable-note" className="text-xs text-muted-foreground">
                      Reference code cannot be changed after creation.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name / Shade <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Medium Warm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. SKU-12345"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="EAN / UPC"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection title="Pricing" description="Price adjustment relative to the base product price.">
            <FormField
              control={form.control}
              name="priceDelta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price delta</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Added to (or subtracted from) the product base price. Use 0 for no adjustment.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {mode === 'create' && (
            <FormSection title="Initial stock" description="Starting stock quantities. Can be updated later via manual stock adjustment.">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reservedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserved quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low-stock threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          value={field.value ?? 5}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>
          )}

          <FormSection title="Settings" description="Default flag and active status.">
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="ref-isDefault"
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="ref-isDefault" className="cursor-pointer font-normal">
                      Default reference
                    </FormLabel>
                  </div>
                  <p className="ml-6 text-xs text-muted-foreground">
                    Only one reference per product can be the default. Setting this will unset the previous default automatically.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="ref-isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="ref-isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title="Compatibility attributes"
            description="Define which skin tones, types, and styles this variant is compatible with. The entire list is replaced on save."
          >
            <CompatibilityEditor
              value={attributes}
              onChange={setAttributes}
              disabled={isSubmitting}
            />
          </FormSection>

          <FormActions
            submitLabel={mode === 'create' ? 'Create reference' : 'Save changes'}
            onCancel={() => navigate(ROUTES.productReferences(productId))}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
