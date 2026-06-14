import { useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

const STACK_ITEMS = [
  { label: 'React + Vite', status: 'ready' },
  { label: 'TypeScript (strict)', status: 'ready' },
  { label: 'React Router v7', status: 'ready' },
  { label: 'TanStack Query v5', status: 'ready' },
  { label: 'Tailwind CSS v3', status: 'ready' },
  { label: 'shadcn/ui', status: 'ready' },
  { label: 'Zod + React Hook Form', status: 'ready' },
  { label: 'MSW + Vitest', status: 'ready' },
]

export function HomePage() {
  const queryClient = useQueryClient()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{env.VITE_APP_NAME}</h1>
          <p className="mt-2 text-muted-foreground">Admin Dashboard</p>
        </div>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Foundation Ready</AlertTitle>
          <AlertDescription>
            The frontend foundation for Task 1 has been successfully initialized.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Stack Status</CardTitle>
            <CardDescription>
              All foundation dependencies are installed and configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {STACK_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">API Base URL:</span>{' '}
              {env.VITE_API_BASE_URL}
            </p>
            <p>
              <span className="font-medium text-foreground">App Name:</span> {env.VITE_APP_NAME}
            </p>
            <p>
              <span className="font-medium text-foreground">Query Devtools:</span>{' '}
              {env.VITE_ENABLE_QUERY_DEVTOOLS ? 'Enabled' : 'Disabled'}
            </p>
            <p>
              <span className="font-medium text-foreground">Query Client:</span>{' '}
              {queryClient ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="default">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Task 1 — Foundation ✓ &nbsp;|&nbsp; Next: Task 2 — Authentication
        </p>
      </div>
    </main>
  )
}
