import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getSnippet } from '@/lib/api/snippets'
import { useSnippetLoader } from '@/hooks/useSnippetLoader'
import { useViewMode } from '@/hooks/useViewMode'
import { useAuth } from '@/hooks/useAuth'
import LoadingState from '@/components/snippet/LoadingState'
import SnippetPreview from '@/components/snippet/SnippetPreview'
import SnippetInfo from '@/components/snippet/SnippetInfo'
import SnippetCode from '@/components/snippet/SnippetCode'
import ViewModeToggle from '@/components/snippet/ViewModeToggle'
import DeleteButton from '@/components/snippet/DeleteButton'

export const Route = createFileRoute('/snippets/$id')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['snippet', params.id],
      queryFn: () => getSnippet(params.id),
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { snippet, isLoading, isError } = useSnippetLoader(id)
  const { viewMode, setViewMode } = useViewMode()
  const { user } = useAuth()
  const [previewWidth, setPreviewWidth] = useState<number | null>(null)

  if (isLoading || isError) {
    return <LoadingState />
  }

  if (!snippet) return null

  const canDelete = snippet.createdBy?.id === user?.id

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/snippets"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to snippets
        </Link>
        <div className="flex items-center gap-3">
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          {canDelete && <DeleteButton snippetId={snippet.id} />}
        </div>
      </div>

      {viewMode === 'stacked' ? (
        <div className="space-y-6">
          <SnippetInfo snippet={snippet} />
          <SnippetPreview
            snippet={snippet}
            viewMode={viewMode}
            onWidthChange={setPreviewWidth}
          />
          <SnippetCode snippet={snippet} />
        </div>
      ) : (
        <div className="flex gap-6 items-start" style={{ minHeight: '600px' }}>
          <div
            style={{
              width: previewWidth ? `${previewWidth}px` : undefined,
              flexShrink: 0,
            }}
          >
            <SnippetPreview
              snippet={snippet}
              viewMode={viewMode}
              onWidthChange={setPreviewWidth}
            />
          </div>
          <div className="flex-1 space-y-4 min-w-0">
            <SnippetInfo snippet={snippet} />
            <SnippetCode snippet={snippet} />
          </div>
        </div>
      )}
    </div>
  )
}
