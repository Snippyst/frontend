import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSnippet } from '../../lib/api/snippets'
import { useState, useRef, useEffect } from 'react'
import type { Snippet } from '../../types/snippet'
import TagComp from '@/components/snippet/TagComp'
import VoteButton from '@/components/snippet/VoteButton'
import DownloadButton from '@/components/snippet/DownloadButton'

export const Route = createFileRoute('/snippets/$id')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['snippet', params.id],
      queryFn: () => getSnippet(params.id),
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const {
    data: snippet,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['snippet', id],
    queryFn: () => getSnippet(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Loading snippet...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error?.message}</p>
          <Link
            to="/snippets"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Back to snippets
          </Link>
        </div>
      </div>
    )
  }

  return <SnippetView snippet={snippet} />
}

function SnippetView({ snippet }: { snippet: Snippet }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>(() => {
    const saved = localStorage.getItem('snippetViewMode')
    return (saved as 'split' | 'stacked') || 'split'
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const objectRef = useRef<HTMLObjectElement>(null)

  useEffect(() => {
    const fitToContainer = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const checkLoad = () => {
        const obj = objectRef.current
        if (!obj) return

        const svgDoc = obj.contentDocument
        const svgElement = svgDoc?.querySelector('svg')

        if (svgElement) {
          const viewBox = svgElement.getAttribute('viewBox')
          let svgWidth = parseFloat(svgElement.getAttribute('width') || '0')
          let svgHeight = parseFloat(svgElement.getAttribute('height') || '0')

          if (viewBox && (!svgWidth || !svgHeight)) {
            const viewBoxValues = viewBox.split(' ').map(Number)
            svgWidth = viewBoxValues[2]
            svgHeight = viewBoxValues[3]
          }

          if (svgWidth && svgHeight) {
            const scaleX = containerWidth / svgWidth
            const scaleY = containerHeight / svgHeight
            const newScale = Math.min(scaleX, scaleY) * 0.9
            setScale(newScale)
            setPosition({
              x: (containerWidth - svgWidth * newScale) / 2,
              y: (containerHeight - svgHeight * newScale) / 2,
            })
          }
        }
      }

      if (objectRef.current) {
        const obj = objectRef.current
        if (obj.contentDocument) {
          checkLoad()
        } else {
          obj.addEventListener('load', checkLoad)
          return () => obj.removeEventListener('load', checkLoad)
        }
      } else {
        setTimeout(checkLoad, 100)
      }
    }

    fitToContainer()
  }, [snippet.image, viewMode])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus(label)
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getContentWithoutImports = (content: string) => {
    const lines = content.split('\n')
    const firstNonImportIndex = lines.findIndex(
      (line) => line.trim() && !line.trim().startsWith('#import'),
    )
    return lines.slice(firstNonImportIndex).join('\n')
  }

  const getCopyRecommendationContent = (
    content: string,
    recommendation: string,
  ) => {
    if (!recommendation) return content
    const match = recommendation.match(/(\d+):(\d+)-(\d+):(\d+)/)
    if (!match) return content

    const startLine = parseInt(match[1], 10) - 1
    const startChar = parseInt(match[2], 10) - 1
    const endLine = parseInt(match[3], 10) - 1
    const endChar = parseInt(match[4], 10)

    const lines = content.split('\n')

    if (startLine === endLine) {
      return lines[startLine].substring(startChar, endChar)
    }

    const result = []
    result.push(lines[startLine].substring(startChar))

    for (let i = startLine + 1; i < endLine; i++) {
      result.push(lines[i])
    }

    result.push(lines[endLine].substring(0, endChar))

    return result.join('\n')
  }

  const handleViewModeChange = (mode: 'split' | 'stacked') => {
    setViewMode(mode)
    localStorage.setItem('snippetViewMode', mode)
  }

  const InfoSection = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {snippet.title}
      </h1>
      {snippet.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 max-h-32 overflow-auto">
          {snippet.description}
        </p>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Created by:
          </span>{' '}
          <span className="text-gray-900 dark:text-gray-100">
            {snippet.author || snippet.createdBy.username}
          </span>
          <div />
          {snippet.author && (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Uploaded by:
              </span>{' '}
              <span className="text-gray-900 dark:text-gray-100">
                {snippet.createdBy.username}
              </span>
            </>
          )}
        </div>

        {snippet.updatedAt && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Updated:
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {new Date(snippet.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {snippet.versions && snippet.versions.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Versions:
              </span>
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs cursor-help"
                title="These versions indicate successful compilation at the time of testing. Versions do not mean the snippet is incompatible with other versions. Currently only the newest version can be compiled."
              >
                ?
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {snippet.versions.map((v, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${
                    v.success
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                  }`}
                >
                  {v.version}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {snippet.tags && snippet.tags.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Tags:
          </span>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <TagComp key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <VoteButton
          snippetId={snippet.id}
          initialUpvotes={snippet.numberOfUpvotes ?? 0}
          initialIsUpvoted={snippet.isUpvoted ?? false}
        />
      </div>

      {snippet.packages && snippet.packages.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Packages:
          </span>
          <div className="space-y-1">
            {snippet.packages.map((pkg, idx) => (
              <div
                key={idx}
                className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded"
              >
                {pkg.namespace}/{pkg.name}@{pkg.version}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const PreviewSection = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-fit">
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </span>
        <div className="flex items-center gap-2">
          <DownloadButton snippet={snippet} type="svg" format="large" />
          <DownloadButton snippet={snippet} type="png" format="large" />
          <button
            onClick={() => setScale(1)}
            className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            Reset
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-white"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          height: viewMode === 'stacked' ? '500px' : '760px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={svgRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="inline-block"
        >
          <object
            ref={objectRef}
            data={snippet.image}
            type="image/svg+xml"
            className="max-w-none"
            style={{ pointerEvents: 'none' }}
          >
            <img
              src={snippet.image}
              alt={snippet.title}
              className="max-w-none"
              draggable={false}
              style={{ pointerEvents: 'none' }}
            />
          </object>
        </div>
      </div>
    </div>
  )

  const CodeSection = snippet.content && (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Code
        </span>
        {copyStatus && (
          <span className="text-xs text-green-600 dark:text-green-400">
            {copyStatus} copied!
          </span>
        )}
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
        <button
          onClick={() => copyToClipboard(snippet.content!, 'All')}
          title="Copies the entire snippet content"
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
        >
          Copy
        </button>

        <button
          onClick={() =>
            copyToClipboard(
              getContentWithoutImports(snippet.content!),
              'Content',
            )
          }
          title="Copies the snippet content without any import statements at the top"
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
        >
          Copy content
        </button>

        {snippet.copyRecommendation && (
          <button
            onClick={() =>
              copyToClipboard(
                getCopyRecommendationContent(
                  snippet.content!,
                  snippet.copyRecommendation!,
                ),
                'Recommendation',
              )
            }
            title="Copies the recommended lines for copying. This value is set by the snippet author."
            className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded transition-colors text-blue-700 dark:text-blue-300"
          >
            Copy recommended
          </button>
        )}
      </div>

      <div className="max-h-128 overflow-auto bg-gray-900 dark:bg-black text-gray-100">
        <pre className="p-4 text-xs ">{snippet.content}</pre>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/snippets"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to snippets
        </Link>
        <div className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700">
          <button
            type="button"
            onClick={() => handleViewModeChange('split')}
            className={`rounded px-2 py-1 text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('stacked')}
            className={`rounded px-2 py-1 text-xs font-medium transition-all ${
              viewMode === 'stacked'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Stacked
          </button>
        </div>
      </div>

      {viewMode === 'stacked' ? (
        <div className="space-y-6">
          {InfoSection}
          {PreviewSection}
          {CodeSection}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">{PreviewSection}</div>
          <div className="space-y-4">
            {InfoSection}
            {CodeSection}
          </div>
        </div>
      )}
    </div>
  )
}
