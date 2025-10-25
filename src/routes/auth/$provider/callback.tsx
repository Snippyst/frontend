import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { handleOAuthCallback, type AuthProvider } from '../../../lib/api/auth'
import { currentUserQueryKey } from '../../../hooks/useAuth'

export const Route = createFileRoute('/auth/$provider/callback')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || '',
      state: (search.state as string) || undefined,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { provider } = Route.useParams()
  const { code, state } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function processCallback() {
      if (!code || !state) {
        setError('No authorization code or state received')
        setIsProcessing(false)
        return
      }

      try {
        const { user } = await handleOAuthCallback(
          provider as AuthProvider,
          code,
          state,
        )

        if (user) {
          queryClient.setQueryData(currentUserQueryKey, user)
        }

        navigate({ to: '/' })
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err instanceof Error ? err.message : 'Failed to authenticate')
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [code, provider, navigate, queryClient])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500 p-8 rounded-xl shadow-2xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">
                Authentication Failed
              </h1>
              <p className="text-slate-300 mb-6">{error}</p>
              <a
                href="/auth/login"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-xl shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isProcessing ? 'Authenticating...' : 'Redirecting...'}
            </h1>
            <p className="text-slate-400">
              Please wait while we complete your sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
