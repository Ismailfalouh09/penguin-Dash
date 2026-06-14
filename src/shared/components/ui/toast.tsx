import * as React from 'react'
import { CheckCircle2, Info, X, AlertTriangle, XCircle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export type ToastTone = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  /** Auto-dismiss after this many ms. Pass 0 to keep it until dismissed. */
  duration?: number
}

interface ToastRecord extends Required<Omit<ToastOptions, 'description'>> {
  id: string
  description?: string
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 5000

const TONE_META: Record<ToastTone, { icon: typeof Info; accent: string }> = {
  default: { icon: Info, accent: 'text-foreground' },
  success: { icon: CheckCircle2, accent: 'text-success' },
  error: { icon: XCircle, accent: 'text-destructive' },
  warning: { icon: AlertTriangle, accent: 'text-warning' },
  info: { icon: Info, accent: 'text-info' },
}

/**
 * Lightweight toast provider. Holds the active toast queue and renders the
 * viewport. Consume with the `useToast` hook (see `use-toast.ts`).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID()
      const record: ToastRecord = {
        id,
        title: options.title,
        description: options.description,
        tone: options.tone ?? 'default',
        duration: options.duration ?? DEFAULT_DURATION,
      }
      setToasts((current) => [...current, record])
      if (record.duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), record.duration)
        )
      }
      return id
    },
    [dismiss]
  )

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => clearTimeout(timer))
      pending.clear()
    }
  }, [])

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-4 sm:right-4 sm:p-0"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: string) => void }) {
  const { icon: Icon, accent } = TONE_META[toast.tone]
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'animate-in slide-in-from-bottom-2 fade-in-0 pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-elevated'
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', accent)} aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-sm text-muted-foreground/70 ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <X className="size-4" />
        <span className="sr-only">Dismiss notification</span>
      </button>
    </div>
  )
}

export { ToastContext }
