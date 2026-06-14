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
import type { CreateAttributeGroupDto, UpdateAttributeGroupDto } from '@/lib/api'

const createSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  isCustomerAttribute: z.boolean().optional(),
  isProductAttribute: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  isCustomerAttribute: z.boolean().optional(),
  isProductAttribute: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface AttributeGroupFormCreateProps {
  mode: 'create'
  defaultValues?: Partial<CreateFormValues>
  onSubmit: (data: CreateAttributeGroupDto) => Promise<void>
  isSubmitting: boolean
}

interface AttributeGroupFormEditProps {
  mode: 'edit'
  defaultValues?: Partial<EditFormValues> & { code?: string }
  onSubmit: (data: UpdateAttributeGroupDto) => Promise<void>
  isSubmitting: boolean
}

type AttributeGroupFormProps = AttributeGroupFormCreateProps | AttributeGroupFormEditProps

export function AttributeGroupForm(props: AttributeGroupFormProps) {
  const navigate = useNavigate()

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(props.mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      code: props.mode === 'create' ? (props.defaultValues?.code ?? '') : '',
      name: props.defaultValues?.name ?? '',
      description: props.defaultValues?.description ?? '',
      isCustomerAttribute: props.defaultValues?.isCustomerAttribute ?? false,
      isProductAttribute: props.defaultValues?.isProductAttribute ?? false,
      sortOrder: props.defaultValues?.sortOrder,
      isActive: props.defaultValues?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: CreateFormValues) => {
    if (props.mode === 'create') {
      const dto = {
        code: values.code!,
        name: values.name,
        ...(values.description ? { description: values.description } : {}),
        isCustomerAttribute: values.isCustomerAttribute,
        isProductAttribute: values.isProductAttribute,
        ...(values.sortOrder !== undefined ? { sortOrder: values.sortOrder } : {}),
        isActive: values.isActive,
      } as CreateAttributeGroupDto
      await (props as AttributeGroupFormCreateProps).onSubmit(dto)
    } else {
      const dto = {
        name: values.name,
        ...(values.description ? { description: values.description } : {}),
        isCustomerAttribute: values.isCustomerAttribute,
        isProductAttribute: values.isProductAttribute,
        ...(values.sortOrder !== undefined ? { sortOrder: values.sortOrder } : {}),
        isActive: values.isActive,
      } as UpdateAttributeGroupDto
      await (props as AttributeGroupFormEditProps).onSubmit(dto)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Identifier" description="Core identity fields for this attribute group.">
            {props.mode === 'create' ? (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Code <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. SKIN_TYPE"
                        autoComplete="off"
                        disabled={props.isSubmitting}
                      />
                    </FormControl>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Code cannot be changed after creation.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Code</p>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                    {(props.defaultValues as { code?: string })?.code ?? '—'}
                  </code>
                  <span className="text-xs text-muted-foreground">Cannot be changed</span>
                </div>
              </div>
            )}

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
                      placeholder="e.g. Skin Type"
                      autoComplete="off"
                      disabled={props.isSubmitting}
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
                      disabled={props.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Configuration" description="Control how this attribute group is used.">
            <FormField
              control={form.control}
              name="isCustomerAttribute"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="attr-isCustomerAttribute"
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={props.isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="attr-isCustomerAttribute" className="cursor-pointer font-normal">
                      Customer attribute
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isProductAttribute"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="attr-isProductAttribute"
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={props.isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="attr-isProductAttribute" className="cursor-pointer font-normal">
                      Product attribute
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      disabled={props.isSubmitting}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
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
                      id="attr-isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={props.isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="attr-isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Deactivating may affect quiz configuration, product compatibility, and recommendations.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormActions
            submitLabel={props.mode === 'create' ? 'Create attribute group' : 'Save changes'}
            onCancel={() => navigate(ROUTES.attributes)}
            isSubmitting={props.isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
