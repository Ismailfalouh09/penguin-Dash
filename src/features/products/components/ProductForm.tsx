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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { FormLayout } from '@/shared/components/forms/FormLayout'
import { FormSection } from '@/shared/components/forms/FormSection'
import { FormActions } from '@/shared/components/forms/FormActions'
import { ROUTES } from '@/config/routes'
import { useCategoryList } from '@/features/categories/hooks/use-categories'
import { useBrandList } from '@/features/brands/hooks/use-brands'
import type { ProductResponse, CreateProductDto } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'
import type { AdminCategoryResponse, AdminBrandResponse } from '@/lib/api'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().optional(),
  basePrice: z
    .number({ invalid_type_error: 'Base price must be a number' })
    .nonnegative('Must be 0 or more'),
  costPrice: z
    .number({ invalid_type_error: 'Cost price must be a number' })
    .nonnegative()
    .optional(),
  currency: z.string().min(1, 'Currency is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  isActive: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductResponse>
  onSubmit: (data: CreateProductDto) => Promise<void>
  isSubmitting: boolean
  mode: 'create' | 'edit'
}

export function ProductForm({ defaultValues, onSubmit, isSubmitting, mode }: ProductFormProps) {
  const navigate = useNavigate()

  const categoriesQuery = useCategoryList({ pageSize: 100 })
  const brandsQuery = useBrandList({ pageSize: 100 })

  const rawCategories =
    categoriesQuery.data?.status === 200
      ? (categoriesQuery.data.data as unknown as PaginatedResponse<AdminCategoryResponse>)
      : null
  const categories = rawCategories?.data ?? []

  const rawBrands =
    brandsQuery.data?.status === 200
      ? (brandsQuery.data.data as unknown as PaginatedResponse<AdminBrandResponse>)
      : null
  const brands = rawBrands?.data ?? []

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: defaultValues?.category?.id ?? '',
      brandId: defaultValues?.brand?.id ?? '',
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      description: '',
      basePrice: defaultValues?.basePrice ?? 0,
      costPrice: undefined,
      currency: defaultValues?.currency ?? 'MAD',
      status: (defaultValues?.status as ProductFormValues['status']) ?? 'DRAFT',
      isActive: true,
    },
  })

  const handleSubmit = async (values: ProductFormValues) => {
    const dto: CreateProductDto = {
      categoryId: values.categoryId,
      name: values.name,
      slug: values.slug,
      basePrice: values.basePrice,
      currency: values.currency,
      ...(values.brandId ? { brandId: values.brandId } : {}),
      ...(values.description ? { description: values.description } : {}),
      ...(values.costPrice !== undefined ? { costPrice: values.costPrice } : {}),
      ...(values.status ? { status: values.status as CreateProductDto['status'] } : {}),
      isActive: values.isActive,
    }
    await onSubmit(dto)
  }

  const nameValue = form.watch('name')

  const handleNameBlur = () => {
    if (mode === 'create' && nameValue && !form.getValues('slug')) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      form.setValue('slug', slug)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Details" description="Core product information.">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Foundation X"
                      autoComplete="off"
                      disabled={isSubmitting}
                      onBlur={handleNameBlur}
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
                  <FormLabel>
                    Slug{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="foundation-x"
                      autoComplete="off"
                      disabled={isSubmitting}
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
                      placeholder="Optional product description"
                      disabled={isSubmitting}
                      rows={4}
                      className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Classification" description="Category and brand assignment.">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting || categoriesQuery.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={categoriesQuery.isLoading ? 'Loading…' : 'Select a category'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    disabled={isSubmitting || brandsQuery.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={brandsQuery.isLoading ? 'Loading…' : 'No brand'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No brand</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Pricing" description="Base price and currency.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Base price{' '}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Currency{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MAD"
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="max-w-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Status" description="Product visibility and lifecycle status.">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value ?? 'DRAFT'}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormActions
            submitLabel={mode === 'create' ? 'Create product' : 'Save changes'}
            onCancel={() => navigate(ROUTES.products)}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
