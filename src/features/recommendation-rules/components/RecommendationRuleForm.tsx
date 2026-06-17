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
import type { CreateRecommendationRuleDto, RecommendationRuleResponse, UpdateRecommendationRuleDto } from '@/lib/api'
import { CreateRecommendationRuleDtoTargetType } from '@/lib/api/generated/models/createRecommendationRuleDtoTargetType'
import { CreateRecommendationRuleDtoConditionType } from '@/lib/api/generated/models/createRecommendationRuleDtoConditionType'

const ruleSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100),
  name: z.string().min(1, 'Name is required').max(200),
  targetType: z.enum(['PACK', 'PRODUCT', 'REFERENCE'], { required_error: 'Target type is required' }),
  conditionType: z.enum(['MUST_MATCH', 'SHOULD_MATCH', 'EXCLUDE_IF_MATCH'], { required_error: 'Condition type is required' }),
  scoreValue: z.coerce.number({ invalid_type_error: 'Score must be a number' }),
  weight: z.coerce.number({ invalid_type_error: 'Weight must be a number' }).optional(),
  isActive: z.boolean().optional(),
})

type RuleFormValues = z.infer<typeof ruleSchema>

interface RecommendationRuleFormCreateProps {
  mode: 'create'
  defaultValues?: Partial<RecommendationRuleResponse>
  onSubmit: (data: CreateRecommendationRuleDto) => Promise<void>
  isSubmitting: boolean
}

interface RecommendationRuleFormEditProps {
  mode: 'edit'
  defaultValues?: Partial<RecommendationRuleResponse>
  onSubmit: (data: UpdateRecommendationRuleDto) => Promise<void>
  isSubmitting: boolean
}

type RecommendationRuleFormProps = RecommendationRuleFormCreateProps | RecommendationRuleFormEditProps

const TARGET_OPTIONS = [
  { value: CreateRecommendationRuleDtoTargetType.PACK, label: 'Pack' },
  { value: CreateRecommendationRuleDtoTargetType.PRODUCT, label: 'Product' },
  { value: CreateRecommendationRuleDtoTargetType.REFERENCE, label: 'Reference' },
]

const CONDITION_OPTIONS = [
  { value: CreateRecommendationRuleDtoConditionType.MUST_MATCH, label: 'Must match' },
  { value: CreateRecommendationRuleDtoConditionType.SHOULD_MATCH, label: 'Should match' },
  { value: CreateRecommendationRuleDtoConditionType.EXCLUDE_IF_MATCH, label: 'Exclude if match' },
]

export function RecommendationRuleForm(props: RecommendationRuleFormProps) {
  const { defaultValues, isSubmitting } = props
  const navigate = useNavigate()

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      code: defaultValues?.code ?? '',
      name: defaultValues?.name ?? '',
      targetType: defaultValues?.targetType as RuleFormValues['targetType'] | undefined,
      conditionType: defaultValues?.conditionType as RuleFormValues['conditionType'] | undefined,
      scoreValue: defaultValues?.scoreValue ?? 0,
      weight: defaultValues?.weight ?? 1,
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: RuleFormValues) => {
    if (props.mode === 'create') {
      const dto: CreateRecommendationRuleDto = {
        code: values.code,
        name: values.name,
        targetType: values.targetType as CreateRecommendationRuleDto['targetType'],
        conditionType: values.conditionType as CreateRecommendationRuleDto['conditionType'],
        scoreValue: values.scoreValue,
        weight: values.weight,
        isActive: values.isActive,
      }
      await props.onSubmit(dto)
    } else {
      const dto: UpdateRecommendationRuleDto = {
        name: values.name,
        targetType: values.targetType as UpdateRecommendationRuleDto['targetType'],
        conditionType: values.conditionType as UpdateRecommendationRuleDto['conditionType'],
        scoreValue: values.scoreValue,
        weight: values.weight,
        isActive: values.isActive,
      }
      await props.onSubmit(dto)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FormLayout>
          <FormSection title="Identity" description="Rule code is set at creation and cannot be changed.">
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
                      placeholder="e.g. SKIN_DRY_MATCH"
                      autoComplete="off"
                      disabled={isSubmitting || props.mode === 'edit'}
                      readOnly={props.mode === 'edit'}
                      className={props.mode === 'edit' ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
                    />
                  </FormControl>
                  <FormMessage />
                  {props.mode === 'edit' && (
                    <p className="text-xs text-muted-foreground">Rule code is immutable after creation.</p>
                  )}
                </FormItem>
              )}
            />

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
                      placeholder="e.g. Dry skin attribute match"
                      autoComplete="off"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Scoring" description="Configure how this rule contributes to recommendation scoring.">
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target type <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger aria-label="Target type">
                        <SelectValue placeholder="Select target type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Condition type <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger aria-label="Condition type">
                        <SelectValue placeholder="Select condition type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scoreValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Score value <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      placeholder="e.g. 10"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      placeholder="1"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Status" description="Inactive rules do not affect recommendation scoring.">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      id="rule-isActive"
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="size-4 rounded border border-border accent-primary"
                    />
                    <FormLabel htmlFor="rule-isActive" className="cursor-pointer font-normal">
                      Active
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormActions
            submitLabel={props.mode === 'create' ? 'Create rule' : 'Save changes'}
            onCancel={() => navigate(ROUTES.recommendationRules)}
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
