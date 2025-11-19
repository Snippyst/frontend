import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getSnippet } from '@/lib/api/snippets'
import { useSnippetLoader } from '@/hooks/useSnippetLoader'
import { useViewMode } from '@/hooks/useViewMode'
import { useLayoutMode } from '@/hooks/useLayoutMode'
import { useAuth } from '@/hooks/useAuth'
import LoadingState from '@/components/snippet/LoadingState'
import SnippetPreview from '@/components/snippet/show/SnippetPreview'
import SnippetInfo from '@/components/snippet/show/SnippetInfo'
import SnippetCode from '@/components/snippet/show/SnippetCode'
import ViewModeToggle from '@/components/snippet/show/ViewModeToggle'
import DeleteButton from '@/components/snippet/DeleteButton'
import { Comments } from '@/components/snippet/Comments'
import { generateSEOMeta, generateStructuredData } from '@/components/SEO'

export const Route = createFileRoute('/snippets/$id')({
  loader: async ({ context, params }) => {
    return await context.queryClient.fetchQuery({
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
  head: ({ loaderData, params }) => {
    const snippet = loaderData as any

    if (!snippet) {
      return {
        meta: generateSEOMeta({
          title: 'Snippet - Snippyst',
          description:
            'View Typst snippets on Snippyst. Share, create, and explore typst snippets!',
          url: `https://snippyst.com/snippets/${params.id}`,
        }),
      }
    }

    const author = snippet.author || snippet.createdBy?.username || 'Unknown'
    const createdBy = snippet.createdBy?.username || 'Unknown'
    const tags = snippet.tags?.map((tag: any) => tag.name) || []
    
    const descriptionParts = [`By ${author}.`]
    if (snippet.description) {
      descriptionParts.push(snippet.description)
    }
    descriptionParts.push('Typst Snippets.')
    if (tags.length > 0) {
      descriptionParts.push(`Tags: ${tags.join(', ')}.`)
    }
    const description = descriptionParts.join(' ')

    const structuredData = generateStructuredData({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      image: snippet.image,
      author: snippet.author || undefined,
      createdBy,
      createdAt: snippet.createdAt,
      updatedAt: snippet.lastUpdatedAt,
      tags: snippet.tags,
      code: snippet.code,
    })

    return {
      meta: generateSEOMeta({
        title: `${snippet.title} - Snippyst`,
        description,
        image: snippet.image ? `${snippet.image}/preview` : undefined,
        url: `https://snippyst.com/snippets/${params.id}`,
        type: 'article',
        author,
        tags,
        datePublished: snippet.createdAt,
        dateModified: snippet.lastUpdatedAt || snippet.createdAt,
      }),
      scripts: [
        {
          type: 'application/ld+json',
          children: structuredData.children,
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { snippet, isLoading, isError } = useSnippetLoader(id)
  const { viewMode, setViewMode } = useViewMode()
  const { layoutMode, setLayoutMode } = useLayoutMode()
  const { user } = useAuth()
  const [previewWidth, setPreviewWidth] = useState<number | null>(null)
  const [codeWidth, setCodeWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 600
    return Math.min(window.innerWidth * 0.5, 800)
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const minWidth = 300
      const maxWidth = window.innerWidth * 0.7
      const deltaX = e.clientX - resizeStartX
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, resizeStartWidth + deltaX),
      )
      setCodeWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStartX, resizeStartWidth])

  if (isLoading || isError) {
    return <LoadingState />
  }

  if (!snippet) return null

  const canDelete = snippet.createdBy?.id === user?.id
  const canEdit = snippet.createdBy?.id === user?.id

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
          <div className="hidden md:block">
            <ViewModeToggle
              viewMode={viewMode}
              onChange={setViewMode}
              layoutMode={layoutMode}
              onLayoutChange={setLayoutMode}
            />
          </div>
          {/* TODO: Extra component, better styling */}
          {canEdit && (
            <Link
              to="/snippets/$id/edit"
              params={{ id: snippet.id }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Edit
            </Link>
          )}
          {canDelete && <DeleteButton snippetId={snippet.id} />}
        </div>
      </div>

      <div className="block md:hidden space-y-6">
        <SnippetInfo snippet={snippet} />
        <SnippetPreview
          snippet={snippet}
          viewMode="stacked"
          layoutMode={layoutMode}
          onWidthChange={setPreviewWidth}
        />
        <div style={{ height: '600px' }}>
          <SnippetCode snippet={snippet} />
        </div>
        <Comments snippetId={snippet.id} />
      </div>

      <div className="hidden md:block">
        {viewMode === 'stacked' ? (
          <div className="space-y-6">
            <SnippetInfo snippet={snippet} />
            <SnippetPreview
              snippet={snippet}
              viewMode={viewMode}
              layoutMode={layoutMode}
              onWidthChange={setPreviewWidth}
            />
            <div style={{ height: '600px' }}>
              <SnippetCode snippet={snippet} />
            </div>
            <Comments snippetId={snippet.id} />
          </div>
        ) : layoutMode === 'code' ? (
          <>
            <div
              className="flex gap-0 items-stretch overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              <div
                className="flex flex-col overflow-hidden"
                style={{ width: `${codeWidth}px`, flexShrink: 0 }}
              >
                <SnippetCode snippet={snippet} />
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  setResizeStartX(e.clientX)
                  setResizeStartWidth(codeWidth)
                  setIsResizing(true)
                }}
                className="px-2 flex items-center justify-center shrink-0 cursor-col-resize group"
                style={{ userSelect: 'none' }}
              >
                <div className="w-px h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col space-y-4 overflow-hidden">
                <SnippetInfo snippet={snippet} />
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <SnippetPreview
                    snippet={snippet}
                    viewMode={viewMode}
                    layoutMode={layoutMode}
                    onWidthChange={setPreviewWidth}
                  />
                </div>
              </div>
            </div>
            <Comments snippetId={snippet.id} />
          </>
        ) : (
          <>
            <div
              className="flex gap-6 items-stretch overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              <div
                style={{
                  width: previewWidth ? `${previewWidth}px` : undefined,
                  flexShrink: 0,
                }}
                className="flex flex-col overflow-hidden"
              >
                <SnippetPreview
                  snippet={snippet}
                  viewMode={viewMode}
                  layoutMode={layoutMode}
                  onWidthChange={setPreviewWidth}
                />
              </div>
              <div className="flex-1 flex flex-col space-y-4 min-w-0 overflow-hidden">
                <SnippetInfo snippet={snippet} />
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <SnippetCode snippet={snippet} />
                </div>
              </div>
            </div>
            <Comments snippetId={snippet.id} />
          </>
        )}
      </div>
    </div>
  )
}
