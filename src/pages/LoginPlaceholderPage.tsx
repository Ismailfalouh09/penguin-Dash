import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { AppLogo } from '@/shared/components/common/AppLogo'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Info } from 'lucide-react'

/**
 * Standalone login screen — design preview only. The form is intentionally
 * non-functional; real authentication (POST /auth/login) lands in Task 3.
 */
export function LoginPlaceholderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <AppLogo />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access the Penguin Beauty admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="size-4" />
              <AlertTitle>Design preview</AlertTitle>
              <AlertDescription>
                Authentication is not implemented yet. This screen is a visual placeholder for Task
                3.
              </AlertDescription>
            </Alert>

            {/* Non-functional preview form */}
            <form
              className="space-y-4"
              onSubmit={(event) => event.preventDefault()}
              aria-disabled="true"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="off"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" disabled />
              </div>
              <Button type="submit" className="w-full" disabled>
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm">
              <Link
                to={ROUTES.dashboard}
                className="text-primary underline-offset-4 hover:underline"
              >
                Continue to dashboard preview
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
