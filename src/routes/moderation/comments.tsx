import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getModerationUsers } from '@/lib/api/users'
import { getUserComments, deleteComment } from '@/lib/api/comments'
import { PageHeader } from '@/components/moderation/PageHeader'
import { SearchBar } from '@/components/moderation/SearchBar'
import { Pagination } from '@/components/moderation/Pagination'
import { LoadingList } from '@/components/moderation/LoadingList'
import { EmptyState } from '@/components/moderation/EmptyState'
import { ActionButton } from '@/components/moderation/ActionButton'
import { Trash2 } from 'lucide-react'
import { z } from 'zod'
import { useState } from 'react'
import type { Comment } from '@/types/comments'

const commentsSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/moderation/comments')({
  validateSearch: commentsSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [commentsPage, setCommentsPage] = useState(1)

  if (!user?.isPrivileged) {
    return <Navigate to="/" />
  }

  const abilities = user.abilities || []
  const canManageComments = abilities.includes('comments:manage')
  const canManageUsers = abilities.includes('users:manage')

  if (!canManageComments || !canManageUsers) {
    return <Navigate to="/moderation" />
  }

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['moderation', 'users', searchParams.page, searchParams.search],
    queryFn: () =>
      getModerationUsers({
        page: searchParams.page,
        perPage: 20,
      }),
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['moderation', 'user-comments', selectedUserId, commentsPage],
    queryFn: () =>
      getUserComments({
        userId: selectedUserId!,
        page: commentsPage,
        perPage: 25,
      }),
    enabled: !!selectedUserId,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'user-comments', selectedUserId],
      })
    },
  })

  const handleSearch = (value: string) => {
    navigate({
      search: { page: 1, search: value || undefined },
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      search: { ...searchParams, page: newPage },
    })
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)
    setCommentsPage(1)
  }

  const handleDelete = async (commentId: string) => {
    await deleteMutation.mutateAsync(commentId)
  }

  const handleCommentsPageChange = (newPage: number) => {
    setCommentsPage(newPage)
  }

  if (selectedUserId) {
    const selectedUser = usersData?.data.find((u) => u.id === selectedUserId)

    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <button
            onClick={() => setSelectedUserId(null)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to users
          </button>
        </div>

        <PageHeader
          title={`Comments by ${selectedUser?.username || 'User'}`}
          description="View and manage all comments by this user"
        />

        {isLoadingComments ? (
          <LoadingList count={10} height="h-24" />
        ) : commentsData?.data.length === 0 ? (
          <EmptyState message="No comments found for this user" />
        ) : (
          <>
            <div className="space-y-3">
              {commentsData?.data.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {comment.createdAt && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ActionButton
                        onClick={() => handleDelete(comment.id)}
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

            {commentsData?.meta && (
              <Pagination
                currentPage={commentsPage}
                lastPage={commentsData.meta.lastPage}
                onPageChange={handleCommentsPageChange}
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title="User Comments"
        description="Select a user to view and manage their comments"
      />

      <SearchBar
        initialValue={searchParams.search}
        placeholder="Search users..."
        onSearch={handleSearch}
      />

      {isLoadingUsers ? (
        <LoadingList count={10} height="h-20" />
      ) : usersData?.data.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <>
          <div className="space-y-3">
            {usersData?.data.map((moderationUser) => (
              <div
                key={moderationUser.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                onClick={() => handleUserSelect(moderationUser.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {moderationUser.username}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      ID: {moderationUser.id}
                    </p>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">→</div>
                </div>
              </div>
            ))}
          </div>

          {usersData?.meta && (
            <Pagination
              currentPage={searchParams.page}
              lastPage={usersData.meta.lastPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}
