import { createFileRoute, Navigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getSnippets, deleteSnippet } from '@/lib/api/snippets'
import { PageHeader } from '@/components/moderation/PageHeader'
import { SearchBar } from '@/components/moderation/SearchBar'
import { Pagination } from '@/components/moderation/Pagination'
import { LoadingList } from '@/components/moderation/LoadingList'
import { EmptyState } from '@/components/moderation/EmptyState'
import { ActionButton } from '@/components/moderation/ActionButton'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { z } from 'zod'

const snippetsSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/moderation/snippets')({
  validateSearch: snippetsSearchSchema,
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
  const canManage = abilities.includes('snippets:manage')

  if (!canManage) {
    return <Navigate to="/moderation" />
  }

  const { data, isLoading } = useQuery({
    queryKey: ['moderation', 'snippets', searchParams.page, searchParams.search],
    queryFn: () =>
      getSnippets({
        page: searchParams.page,
        perPage: 20,
        search: searchParams.search,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSnippet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'snippets'] })
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })

  const handleSearch = (value: string) => {
    navigate({
      search: { page: 1, search: value || undefined },
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
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
        title="Manage Snippets"
        description="Edit and delete snippets"
      />

      <SearchBar
        initialValue={searchParams.search}
        placeholder="Search snippets..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingList count={5} height="h-32" />
      ) : data?.data.length === 0 ? (
        <EmptyState message="No snippets found" />
      ) : (
        <>
          <div className="space-y-3">
            {data?.data.map((snippet) => (
              <div
                key={snippet.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {snippet.title}
                      </h3>
                      <Link
                        to="/snippets/$id"
                        params={{ id: snippet.id }}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    {snippet.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {snippet.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-500">
                      <span>By: {snippet.createdBy?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>{snippet.numberOfUpvotes || 0} upvotes</span>
                      {snippet.tags && snippet.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{snippet.tags.length} tags</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/snippets/$id/edit" params={{ id: snippet.id }}>
                      <ActionButton
                        onClick={() => {}}
                        icon={<Edit className="w-4 h-4" />}
                        variant="secondary"
                      >
                        Edit
                      </ActionButton>
                    </Link>
                    <ActionButton
                      onClick={() => handleDelete(snippet.id, snippet.title)}
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
