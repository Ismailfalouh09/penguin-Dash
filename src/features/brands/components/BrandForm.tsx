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
import { ROUTES } from '@/config/routes'
import type { AdminBrandResponse, CreateBrandDto } from '@/lib/api'

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

type BrandFormValues = z.infer<typeof brandSchema>

interface BrandFormProps {
  defaultValues?: Partial<AdminBrandResponse>
  onSubmit: (data: CreateBrandDto) => Promise<void>
  isSubmitting: boolean
  mode: 'create' | 'edit'
}

export function BrandForm({ defaultValues, onSubmit, isSubmitting, mode }: BrandFormProps) {
  const navigate = useNavigate()

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: '',
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: BrandFormValues) => {
    const dto: CreateBrandDto = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      isActive: values.isActive,
    }
    await onSubmit(dto)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Details" description="Basic brand information.">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. L'Oréal"
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
                    <Input
                      {...field}
                      placeholder="Optional description"
                      disabled={isSubmitting}
                    />
                  </FormControl>
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
                      id="brand-isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="brand-isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormActions
            submitLabel={mode === 'create' ? 'Create brand' : 'Save changes'}
            onCancel={() => navigate(ROUTES.brands)}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
