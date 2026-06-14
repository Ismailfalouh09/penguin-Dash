import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  )
}
