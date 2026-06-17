import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Package } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useRecommendationPreview } from '@/features/recommendation-rules/hooks/use-recommendation-rules'
import type { RecommendationResponse, RecommendationPackResponse } from '@/lib/api'

const previewSchema = z.object({
  customerProfileId: z.string().min(1, 'Customer profile ID is required'),
})

type PreviewFormValues = z.infer<typeof previewSchema>

function PackResultCard({ pack, rank }: { pack: RecommendationPackResponse; rank: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">#{rank}</span>
            <h3 className="font-semibold">{pack.pack.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{pack.pack.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge tone="success" withDot={false}>
            {pack.matchPercentage}% match
          </StatusBadge>
          <span className="text-xs text-muted-foreground">Score: {pack.totalScore}</span>
        </div>
      </div>

      {pack.reasonSummary && (
        <p className="text-sm text-muted-foreground">{pack.reasonSummary}</p>
      )}

      {pack.items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selected items</p>
          <ul className="space-y-1">
            {pack.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.product.name}</span>
                <span className="text-muted-foreground tabular-nums">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function RecommendationRulePreviewPage() {
  const { toast } = useToast()
  const preview = useRecommendationPreview()
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  const form = useForm<PreviewFormValues>({
    resolver: zodResolver(previewSchema),
    defaultValues: { customerProfileId: '' },
  })

  const handleSubmit = async (values: PreviewFormValues) => {
    setResult(null)
    const response = await preview.mutate({ customerProfileId: values.customerProfileId })
    if (response && response.status === 200) {
      const data = response.data as unknown as RecommendationResponse
      setResult(data)
      if (data.recommendedPacks.length === 0) {
        toast({ tone: 'warning', title: 'No results', description: 'No packs matched for this profile.' })
      }
    } else {
      toast({ tone: 'error', title: 'Preview failed', description: 'Could not run preview. Check the profile ID and try again.' })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Recommendation preview"
          description="Preview current rule effects for a customer profile. Results are not stored and do not affect any recommendation history."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.recommendationRules}>
                <ArrowLeft className="size-4" />
                Rules
              </Link>
            </Button>
          }
        />

        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          This preview is non-persistent. It shows how the current active rules would rank packs for a given customer profile ID, without creating any recommendation session or result.
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="customerProfileId"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>
                    Customer profile ID <span aria-hidden="true" className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="UUID from POST /quiz/profiles"
                      autoComplete="off"
                      disabled={preview.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Use the profile ID returned by the customer quiz flow.
                  </p>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={preview.isPending}>
              <Play className="size-4" />
              {preview.isPending ? 'Running preview…' : 'Run preview'}
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Results
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({result.recommendedPacks.length} pack{result.recommendedPacks.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <span className="text-xs text-muted-foreground">
                Algorithm: {result.algorithmVersion}
              </span>
            </div>

            {result.recommendedPacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
                <Package className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="font-medium text-muted-foreground">No packs matched</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No active rules produced results for this profile. Check your rule configuration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {result.recommendedPacks.map((pack) => (
                  <PackResultCard key={pack.recommendationResultId} pack={pack} rank={pack.rank} />
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Preview results are not stored. Run the preview again after changing rules to see updated scoring.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
