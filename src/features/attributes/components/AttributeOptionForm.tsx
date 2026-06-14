import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import type { CreateAttributeOptionDto, UpdateAttributeOptionDto } from '@/lib/api'

const createSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100),
  label: z.string().min(1, 'Label is required').max(200),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

const editSchema = z.object({
  label: z.string().min(1, 'Label is required').max(200),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface AttributeOptionFormCreateProps {
  mode: 'create'
  defaultValues?: Partial<CreateFormValues>
  onSubmit: (data: CreateAttributeOptionDto) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

interface AttributeOptionFormEditProps {
  mode: 'edit'
  defaultValues?: Partial<EditFormValues> & { code?: string }
  onSubmit: (data: UpdateAttributeOptionDto) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

type AttributeOptionFormProps = AttributeOptionFormCreateProps | AttributeOptionFormEditProps

export function AttributeOptionForm(props: AttributeOptionFormProps) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(props.mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      code: props.mode === 'create' ? (props.defaultValues?.code ?? '') : '',
      label: props.defaultValues?.label ?? '',
      description: props.defaultValues?.description ?? '',
      sortOrder: props.defaultValues?.sortOrder,
      isActive: props.defaultValues?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: CreateFormValues) => {
    if (props.mode === 'create') {
      const dto = {
        code: values.code!,
        label: values.label,
        ...(values.description ? { description: values.description } : {}),
        ...(values.sortOrder !== undefined ? { sortOrder: values.sortOrder } : {}),
        isActive: values.isActive,
      } as CreateAttributeOptionDto
      await (props as AttributeOptionFormCreateProps).onSubmit(dto)
    } else {
      const dto = {
        label: values.label,
        ...(values.description ? { description: values.description } : {}),
        ...(values.sortOrder !== undefined ? { sortOrder: values.sortOrder } : {}),
        isActive: values.isActive,
      } as UpdateAttributeOptionDto
      await (props as AttributeOptionFormEditProps).onSubmit(dto)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
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
                    placeholder="e.g. OILY"
                    autoComplete="off"
                    disabled={props.isSubmitting}
                  />
                </FormControl>
                <p className="text-[0.8rem] text-muted-foreground">Cannot be changed after creation.</p>
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
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Label <span aria-hidden="true" className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Oily skin"
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
                  id="option-isActive"
                  type="checkbox"
                  checked={field.value ?? true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={props.isSubmitting}
                  className="size-4 rounded border border-border accent-primary"
                />
                <FormLabel htmlFor="option-isActive" className="cursor-pointer font-normal">
                  Active
                </FormLabel>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Deactivating may affect quiz configuration and product compatibility.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={props.isSubmitting}>
            {props.isSubmitting ? 'Saving…' : props.mode === 'create' ? 'Create option' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
