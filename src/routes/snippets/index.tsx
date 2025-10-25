import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { getSnippets } from '../../lib/api/snippets'
import { getTags } from '../../lib/api/tags'
import type { Snippet, SnippetsResponse } from '../../types/snippet'
import type { Tag } from '../../types/tags'
import SnippetComp from '@/components/snippet/SnippetComp'
import MultiSelect from '@/components/ui/MultiSelect'
import { z } from 'zod'

const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const snippetsSearchSchema = z.object({
  tags: z.array(tagSchema).optional().default([]),
})

export const Route = createFileRoute('/snippets/')({
  validateSearch: snippetsSearchSchema,
  loader: async ({ context }) => {
    await context.queryClient.prefetchInfiniteQuery({
      queryKey: ['snippets'],
      queryFn: ({ pageParam }) => getSnippets({ page: pageParam, perPage: 10 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: SnippetsResponse) => {
        return lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined
      },
    })
    await context.queryClient.prefetchQuery({
      queryKey: ['tags'],
      queryFn: () => getTags({ page: 1, perPage: 100 }),
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { tags: selectedTags = [] } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const selectedTagIds = selectedTags.map((tag) => tag.id)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['snippets', { tags: selectedTagIds }],
    queryFn: ({ pageParam }) =>
      getSnippets({ page: pageParam, perPage: 10, tags: selectedTagIds }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined
    },
  })

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', searchQuery],
    queryFn: () => getTags({ page: 1, perPage: 100, search: searchQuery }),
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading snippets...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error:{' '}
          {error instanceof Error ? error.message : 'Failed to load snippets'}
        </div>
      </div>
    )
  }

  const allSnippets = data?.pages.flatMap((page) => page.data) ?? []
  const tags = tagsData?.data ?? []

  const handleTagSelectionChange = (newSelectedTags: Tag[]) => {
    navigate({
      to: '/snippets',
      search: {
        tags: newSelectedTags.map((tag) => ({ id: tag.id, name: tag.name })),
      },
    })
  }

  const handleTagSearch = (query: string) => {
    setSearchQuery(query)
  }

  const multiSelectTags = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.numberOfSnippets,
  }))

  const multiSelectSelectedTags = selectedTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Snippets</h1>

      <div className="mb-8">
        <MultiSelect
          items={multiSelectTags}
          selectedItems={multiSelectSelectedTags}
          onSelectionChange={handleTagSelectionChange}
          label="Filter by Tags"
          searchPlaceholder="Search tags..."
          placeholder="No tags available"
          isLoading={tagsLoading}
          onSearch={handleTagSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSnippets.map((snippet: Snippet) => (
          <SnippetComp snippet={snippet} key={snippet.id} />
        ))}
      </div>

      <div ref={observerTarget} className="mt-8 text-center text-gray-600">
        {isFetchingNextPage ? (
          <div className="py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading more snippets...</p>
          </div>
        ) : hasNextPage ? (
          <p className="py-4">Scroll down to load more...</p>
        ) : (
          <p className="py-4">No more snippets to load.</p>
        )}
      </div>
    </div>
  )
}
