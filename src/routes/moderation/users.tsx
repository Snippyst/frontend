import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import {
  getModerationUsers,
  disableUser,
  enableUser,
  deleteUser,
} from '@/lib/api/users'
import { PageHeader } from '@/components/moderation/PageHeader'
import { SearchBar } from '@/components/moderation/SearchBar'
import { Pagination } from '@/components/moderation/Pagination'
import { LoadingList } from '@/components/moderation/LoadingList'
import { EmptyState } from '@/components/moderation/EmptyState'
import { ActionButton } from '@/components/moderation/ActionButton'
import { UserX, UserCheck, Trash2, Calendar, Shield } from 'lucide-react'
import { z } from 'zod'

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const usersSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/moderation/users')({
  validateSearch: usersSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const queryClient = useQueryClient()

  if (!user?.isPrivileged) {
    return <Navigate to="/" />
  }

  const abilities = user.abilities || []
  const canManage = abilities.includes('users:manage')

  if (!canManage) {
    return <Navigate to="/moderation" />
  }

  const { data, isLoading } = useQuery({
    queryKey: ['moderation', 'users', searchParams.page, searchParams.search],
    queryFn: () =>
      getModerationUsers({
        page: searchParams.page,
        perPage: 20,
      }),
  })

  const disableMutation = useMutation({
    mutationFn: (id: string) => disableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'users'] })
    },
  })

  const enableMutation = useMutation({
    mutationFn: (id: string) => enableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'users'] })
    },
  })

  const handleSearch = (value: string) => {
    navigate({
      search: { page: 1, search: value || undefined },
    })
  }

  const handleDisable = (id: string, username: string) => {
    if (confirm(`Are you sure you want to disable user "${username}"?`)) {
      disableMutation.mutate(id)
    }
  }

  const handleEnable = (id: string, username: string) => {
    if (confirm(`Are you sure you want to enable user "${username}"?`)) {
      enableMutation.mutate(id)
    }
  }

  const handleDelete = (id: string, username: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`,
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      search: { ...searchParams, page: newPage },
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title="Manage Users"
        description="Disable, enable, and delete users"
      />

      <SearchBar
        initialValue={searchParams.search}
        placeholder="Search users..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingList count={10} height="h-20" />
      ) : data?.data.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <>
          <div className="space-y-3">
            {data?.data.map((moderationUser) => (
              <div
                key={moderationUser.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {moderationUser.username}
                      </h3>
                      {moderationUser.disabled && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                      {moderationUser.deletedAt && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Deleted
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        ID: {moderationUser.id}
                      </p>

                      {moderationUser.createdAt && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Joined {formatDate(moderationUser.createdAt)}
                          </span>
                        </div>
                      )}

                      {moderationUser.deletedAt && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Deleted {formatDate(moderationUser.deletedAt)}
                          </span>
                        </div>
                      )}

                      {moderationUser.abilities &&
                        moderationUser.abilities.length > 0 && (
                          <div className="flex items-start gap-1.5 pt-1">
                            <Shield className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-1">
                              {moderationUser.abilities.map((ability) => (
                                <span
                                  key={ability}
                                  className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                >
                                  {ability}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {moderationUser.disabled ? (
                      <ActionButton
                        onClick={() =>
                          handleEnable(
                            moderationUser.id,
                            moderationUser.username,
                          )
                        }
                        icon={<UserCheck className="w-4 h-4" />}
                        loading={enableMutation.isPending}
                        variant="primary"
                      >
                        Enable
                      </ActionButton>
                    ) : (
                      <ActionButton
                        onClick={() =>
                          handleDisable(
                            moderationUser.id,
                            moderationUser.username,
                          )
                        }
                        icon={<UserX className="w-4 h-4" />}
                        loading={disableMutation.isPending}
                        variant="secondary"
                      >
                        Disable
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() =>
                        handleDelete(moderationUser.id, moderationUser.username)
                      }
                      icon={<Trash2 className="w-4 h-4" />}
                      loading={deleteMutation.isPending}
                      variant="danger"
                    >
                      Delete
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data?.meta && (
            <Pagination
              currentPage={searchParams.page}
              lastPage={data.meta.lastPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}
