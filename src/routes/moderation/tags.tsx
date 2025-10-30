import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTags, updateTag, deleteTag } from '@/lib/api/tags'
import { PageHeader } from '@/components/moderation/PageHeader'
import { SearchBar } from '@/components/moderation/SearchBar'
import { Pagination } from '@/components/moderation/Pagination'
import { LoadingList } from '@/components/moderation/LoadingList'
import { EmptyState } from '@/components/moderation/EmptyState'
import { ActionButton } from '@/components/moderation/ActionButton'
import { Edit, Trash2, X, Check } from 'lucide-react'
import type { Tag } from '@/types/tags'
import { z } from 'zod'

const tagsSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/moderation/tags')({
  validateSearch: tagsSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const queryClient = useQueryClient()

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  if (!user?.isPrivileged) {
    return <Navigate to="/" />
  }

  const abilities = user.abilities || []
  const canUpdate = abilities.includes('tags:update')
  const canDelete = abilities.includes('tags:delete')

  if (!canUpdate && !canDelete) {
    return <Navigate to="/moderation" />
  }

  const { data, isLoading } = useQuery({
    queryKey: ['moderation', 'tags', searchParams.page, searchParams.search],
    queryFn: () =>
      getTags({
        page: searchParams.page,
        perPage: 20,
        search: searchParams.search,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; description?: string }
    }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setEditingTag(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  const handleSearch = (value: string) => {
    navigate({
      search: { page: 1, search: value || undefined },
    })
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
    setEditDescription(tag.description || '')
  }

  const handleSave = () => {
    if (!editingTag) return
    updateMutation.mutate({
      id: editingTag,
      data: {
        name: editName,
        description: editDescription,
      },
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
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
      <PageHeader title="Manage Tags" description="Edit and delete tags" />

      <SearchBar
        initialValue={searchParams.search}
        placeholder="Search tags..."
        onSearch={handleSearch}
      />

      {isLoading ? (
        <LoadingList />
      ) : data?.data.length === 0 ? (
        <EmptyState message="No tags found" />
      ) : (
        <>
          <div className="space-y-3">
            {data?.data.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {editingTag === tag.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={handleSave}
                        icon={<Check className="w-4 h-4" />}
                        loading={updateMutation.isPending}
                        variant="primary"
                      >
                        Save
                      </ActionButton>
                      <ActionButton
                        onClick={() => setEditingTag(null)}
                        icon={<X className="w-4 h-4" />}
                        variant="secondary"
                      >
                        Cancel
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {tag.name}
                      </h3>
                      {tag.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {tag.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {tag.numberOfSnippets || 0} snippets
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {canUpdate && (
                        <ActionButton
                          onClick={() => handleEdit(tag)}
                          icon={<Edit className="w-4 h-4" />}
                          variant="secondary"
                        >
                          Edit
                        </ActionButton>
                      )}
                      {canDelete && (
                        <ActionButton
                          onClick={() => handleDelete(tag.id, tag.name)}
                          icon={<Trash2 className="w-4 h-4" />}
                          loading={deleteMutation.isPending}
                          variant="danger"
                        >
                          Delete
                        </ActionButton>
                      )}
                    </div>
                  </div>
                )}
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
