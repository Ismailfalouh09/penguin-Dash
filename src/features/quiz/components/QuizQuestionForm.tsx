import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
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
import { FormLayout } from '@/shared/components/forms/FormLayout'
import { FormSection } from '@/shared/components/forms/FormSection'
import { FormActions } from '@/shared/components/forms/FormActions'
import { ROUTES } from '@/config/routes'
import { useAttributeGroupList } from '@/features/attributes/hooks/use-attributes'
import { useAttributeOptionList } from '@/features/attributes/hooks/use-attribute-options'
import type {
  AttributeGroupResponse,
  AttributeOptionResponse,
  CreateQuizQuestionDto,
  QuizQuestionOptionInputDto,
  QuizQuestionResponse,
  UpdateQuizQuestionDto,
} from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const optionInputSchema = z.object({
  attributeOptionId: z.string().min(1, 'Option is required'),
  displayLabel: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

const questionSchema = z.object({
  attributeGroupId: z.string().min(1, 'Attribute group is required'),
  questionText: z.string().min(1, 'Question text is required').max(500),
  helperText: z.string().optional(),
  selectionType: z.enum(['SINGLE', 'MULTIPLE']).optional(),
  isRequired: z.boolean().optional(),
  stepOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  options: z.array(optionInputSchema).optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuizQuestionFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<QuizQuestionResponse>
  onSubmit: (data: CreateQuizQuestionDto | UpdateQuizQuestionDto) => Promise<void>
  isSubmitting: boolean
}

export function QuizQuestionForm({ mode, defaultValues, onSubmit, isSubmitting }: QuizQuestionFormProps) {
  const navigate = useNavigate()

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      attributeGroupId: defaultValues?.attributeGroup
        ? '' // will be set via useEffect once groups load
        : '',
      questionText: defaultValues?.questionText ?? '',
      helperText: typeof defaultValues?.helperText === 'string' ? defaultValues.helperText : '',
      selectionType: defaultValues?.selectionType ?? 'SINGLE',
      isRequired: defaultValues?.isRequired ?? false,
      stepOrder: defaultValues?.stepOrder,
      isActive: (defaultValues as Record<string, unknown>)?.isActive !== undefined
        ? Boolean((defaultValues as Record<string, unknown>).isActive)
        : true,
      options: defaultValues?.options?.map((o) => ({
        attributeOptionId: o.attributeOptionId,
        displayLabel: typeof o.displayLabel === 'string' ? o.displayLabel : '',
        sortOrder: undefined,
        isActive: true,
      })) ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  // Load all active attribute groups for the dropdown
  const groupsQuery = useAttributeGroupList({ pageSize: 100 })
  const groupsRaw = groupsQuery.data?.status === 200
    ? (groupsQuery.data.data as unknown as PaginatedResponse<AttributeGroupResponse>)
    : null
  const allGroups = groupsRaw?.data ?? []

  const selectedGroupId = form.watch('attributeGroupId')

  // When editing, set the attributeGroupId once groups load
  useEffect(() => {
    if (mode === 'edit' && defaultValues?.attributeGroup && allGroups.length > 0) {
      const matchingGroup = allGroups.find(
        (g) => g.code === defaultValues.attributeGroup?.code
      )
      if (matchingGroup) {
        form.setValue('attributeGroupId', matchingGroup.id)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGroups.length, mode])

  // Load options for the selected group
  const optionsQuery = useAttributeOptionList(selectedGroupId, {
    pageSize: 100,
    isActive: true,
  })
  const optionsRaw = optionsQuery.data?.status === 200 && selectedGroupId
    ? (optionsQuery.data.data as unknown as PaginatedResponse<AttributeOptionResponse>)
    : null
  const groupOptions = optionsRaw?.data ?? []

  // Reset options array when group changes (only in create mode to avoid clearing edit state)
  const prevGroupId = form.getValues('attributeGroupId')
  useEffect(() => {
    if (mode === 'create' && selectedGroupId && selectedGroupId !== prevGroupId) {
      form.setValue('options', [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, mode])

  const handleSubmit = async (values: QuestionFormValues) => {
    const options = (values.options ?? []).map((o) => ({
      attributeOptionId: o.attributeOptionId,
      ...(o.displayLabel ? { displayLabel: o.displayLabel } : {}),
      ...(o.sortOrder !== undefined ? { sortOrder: o.sortOrder } : {}),
      isActive: o.isActive ?? true,
    })) as QuizQuestionOptionInputDto[]

    const dto = {
      attributeGroupId: values.attributeGroupId,
      questionText: values.questionText,
      ...(values.helperText ? { helperText: values.helperText } : {}),
      selectionType: values.selectionType,
      isRequired: values.isRequired,
      ...(values.stepOrder !== undefined ? { stepOrder: values.stepOrder } : {}),
      isActive: values.isActive,
      options: options.length > 0 ? options : undefined,
    } as CreateQuizQuestionDto
    await onSubmit(dto)
  }

  const selectedOptionIds = new Set(fields.map((f) => f.attributeOptionId))

  const availableToAdd = groupOptions.filter((o) => !selectedOptionIds.has(o.id))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Question" description="Quiz question content and configuration.">
            <FormField
              control={form.control}
              name="attributeGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attribute group <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting || mode === 'edit'}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select attribute group…</option>
                      {allGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.code})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {mode === 'edit' && (
                    <p className="text-[0.8rem] text-muted-foreground">
                      Attribute group cannot be changed after creation.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Question text <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. What is your skin type?"
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
              name="helperText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Helper text</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Optional helper text shown below the question"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selection type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="SINGLE">Single choice</option>
                      <option value="MULTIPLE">Multiple choice</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stepOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step order</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g. 1"
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="quiz-isRequired"
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="quiz-isRequired" className="cursor-pointer font-normal">
                      Required
                    </FormLabel>
                  </div>
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
                      id="quiz-isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="quiz-isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Only one active question is allowed per attribute group.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title="Answer options"
            description={
              selectedGroupId
                ? 'Select which options from the attribute group are presented to customers. Saving replaces all existing options.'
                : 'Select an attribute group first to configure answer options.'
            }
          >
            {fields.length > 0 && (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const matchedOption = groupOptions.find((o) => o.id === field.attributeOptionId)
                  return (
                    <div
                      key={field.id}
                      className="flex items-start gap-3 rounded-md border p-3"
                    >
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            {matchedOption?.label ?? field.attributeOptionId}
                          </p>
                          {matchedOption && (
                            <code className="text-xs text-muted-foreground">{matchedOption.code}</code>
                          )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`options.${index}.displayLabel`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Display label override</FormLabel>
                              <FormControl>
                                <Input
                                  {...f}
                                  placeholder="Optional custom label"
                                  disabled={isSubmitting}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove option ${matchedOption?.label ?? index + 1}`}
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        className="mt-0.5 shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedGroupId && availableToAdd.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Add option</p>
                <div className="flex flex-wrap gap-2">
                  {availableToAdd.map((opt) => (
                    <Button
                      key={opt.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() =>
                        append({
                          attributeOptionId: opt.id,
                          displayLabel: '',
                          sortOrder: undefined,
                          isActive: true,
                        })
                      }
                    >
                      <Plus className="mr-1 size-3" />
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedGroupId && groupOptions.length === 0 && !optionsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                No active options found in this attribute group. Add options to the group first.
              </p>
            )}

            {!selectedGroupId && (
              <p className="text-sm text-muted-foreground">
                Select an attribute group above to see and configure its options.
              </p>
            )}
          </FormSection>

          <FormActions
            submitLabel={mode === 'create' ? 'Create question' : 'Save changes'}
            onCancel={() => navigate(ROUTES.quiz)}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
