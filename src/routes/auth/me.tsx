import { useAuth } from '@/hooks/useAuth'
import { deleteAccount, logout } from '@/lib/api/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/me')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, isAuthenticated, refetchUser } = useAuth()
  const navigate = Route.useNavigate()

  if (!user && !isAuthenticated) {
    navigate({ to: '/' })
  }

  return (
    <>
      {!isAuthenticated ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
          <p>Please log in to view your profile.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">My Profile</h1>
          <p className="mb-2">Username: {user?.username}</p>
          <p className="mb-2">Email: {user?.email}</p>
          <div>
            Remaining Computation Time:{' '}
            {(() => {
              const total = Math.max(
                0,
                Math.floor(user?.computationTime ?? 0) / 1000,
              )
              if (total === 0) return '0s'
              const h = Math.floor(total / 3600)
              const m = Math.floor((total % 3600) / 60)
              const s = total % 60
              const parts: string[] = []
              if (h) parts.push(`${h}h`)
              if (m) parts.push(`${m}m`)
              if (s) parts.push(`${s}s`)
              return parts.join(' ')
            })()}
          </div>

          {/* Logout */}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                await logout()
              }}
            >
              Logout
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Danger Zone</h2>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                if (
                  confirm(
                    'Are you sure you want to delete your account? This action cannot be undone.',
                  )
                ) {
                  deleteAccount().then((result) => {
                    if (result?.success) {
                      alert('Account deleted successfully.')
                      navigate({ to: '/' })
                    }
                    refetchUser()
                  })
                }
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </>
  )
}
