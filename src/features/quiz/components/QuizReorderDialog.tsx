import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { useQuizQuestionsReorder } from '@/features/quiz/hooks/use-quiz'
import { useToast } from '@/shared/hooks/use-toast'
import type { QuizQuestionResponse } from '@/lib/api'

interface QuizReorderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: QuizQuestionResponse[]
}

export function QuizReorderDialog({ open, onOpenChange, questions }: QuizReorderDialogProps) {
  const { toast } = useToast()
  const reorder = useQuizQuestionsReorder()

  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    [...questions]
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map((q) => q.id)
  )

  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]))

  const moveUp = (index: number) => {
    if (index === 0) return
    setOrderedIds((prev) => {
      const next = [...prev]
      const a = next[index - 1]!
      const b = next[index]!
      next[index - 1] = b
      next[index] = a
      return next
    })
  }

  const moveDown = (index: number) => {
    if (index === orderedIds.length - 1) return
    setOrderedIds((prev) => {
      const next = [...prev]
      const a = next[index]!
      const b = next[index + 1]!
      next[index] = b
      next[index + 1] = a
      return next
    })
  }

  const handleSave = async () => {
    const dto = {
      questions: orderedIds.map((id, idx) => ({
        questionId: id,
        stepOrder: idx + 1,
      })),
    }
    const result = await reorder.mutate(dto)
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Order saved', description: 'Quiz question order has been updated.' })
      onOpenChange(false)
    } else {
      toast({ tone: 'error', title: 'Save failed', description: 'Could not save the new order. Try again.' })
    }
  }

  const handleCancel = () => {
    setOrderedIds(
      [...questions].sort((a, b) => a.stepOrder - b.stepOrder).map((q) => q.id)
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reorder quiz questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {orderedIds.map((id, index) => {
            const question = questionMap[id]
            if (!question) return null
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <span className="w-6 shrink-0 text-center tabular-nums text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{question.questionText}</span>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Move "${question.questionText}" up`}
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || reorder.isPending}
                    className="h-7 px-2"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Move "${question.questionText}" down`}
                    onClick={() => moveDown(index)}
                    disabled={index === orderedIds.length - 1 || reorder.isPending}
                    className="h-7 px-2"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={reorder.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={reorder.isPending}>
            {reorder.isPending ? 'Saving…' : 'Save order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
