import { createFileRoute } from '@tanstack/react-router'
import { SiCodeberg, SiDiscord, SiGithub } from 'react-icons/si'
import { useState } from 'react'
import { initOAuthRedirectUrl } from '../../lib/api/auth'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Container,
  Link,
} from '../../components/ui'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: 'github' | 'discord') => {
    console.log(`Initiating OAuth login for ${provider}`)
    setIsLoading(provider)
    setError(null)

    await initOAuthRedirectUrl(provider)
  }

  const availableProviders = [
    { name: 'GitHub', id: 'github', icon: <SiGithub size={20} /> },
    { name: 'Discord', id: 'discord', icon: <SiDiscord size={20} /> },
    { name: 'Codeberg', id: 'codeberg', icon: <SiCodeberg size={20} /> },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Container maxWidth="md">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle as="h1" className="text-3xl">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Sign in to your account to continue. If you don't have an
                account one will automatically created
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-error-500/20 border border-error-500 rounded-lg text-error-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {availableProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    onClick={() =>
                      handleOAuthLogin(provider.id as 'github' | 'discord')
                    }
                    loading={isLoading === provider.id}
                    disabled={isLoading !== null}
                    variant="secondary"
                    size="lg"
                    fullWidth
                    leftIcon={!isLoading ? provider.icon : undefined}
                  >
                    {isLoading === provider.id
                      ? 'Connecting...'
                      : `Continue with ${provider.name}`}
                  </Button>
                ))}
              </div>

              <div className="mt-6 text-xs text-text-muted">
                By continuing, you agree to our{' '}
                <Link to="/tos" variant="primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" variant="primary">
                  Privacy Policy
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
