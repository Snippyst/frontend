import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { getSnippets } from '../../lib/api/snippets'
import { getTags, getTagsByIds } from '../../lib/api/tags'
import type { Snippet, SnippetsResponse } from '../../types/snippet'
import type { Tag } from '../../types/tags'
import SnippetComp from '@/components/snippet/SnippetComp'
import SkeletonCard from '@/components/snippet/SkeletonCard'
import MultiSelect from '@/components/ui/MultiSelect'
import { z } from 'zod'

const snippetsSearchSchema = z.object({
  tags: z.array(z.string()).optional().default([]),
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
  const { tags: selectedTagIds = [] } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const { data: selectedTagsData } = useQuery({
    queryKey: ['tags', 'byIds', selectedTagIds],
    queryFn: () => getTagsByIds(selectedTagIds),
    enabled: selectedTagIds.length > 0,
    placeholderData: keepPreviousData,
  })

  const selectedTags = selectedTagIds.length > 0 ? (selectedTagsData ?? []) : []

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPlaceholderData,
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
    placeholderData: keepPreviousData,
  })

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', searchQuery],
    queryFn: () => getTags({ page: 1, perPage: 100, search: searchQuery }),
    placeholderData: keepPreviousData,
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
        tags: newSelectedTags.map((tag) => tag.id),
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
    description: tag.description,
  }))

  const multiSelectSelectedTags = selectedTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
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

      {isLoading && allSnippets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
              opacity: isPlaceholderData ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {allSnippets.map((snippet: Snippet) => (
              <SnippetComp snippet={snippet} key={snippet.id} />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))}
            </div>
          )}

          <div ref={observerTarget} className="mt-8 text-center text-gray-600">
            {isFetchingNextPage ? (
              <p className="py-4">Loading more snippets...</p>
            ) : hasNextPage ? (
              <p className="py-4">Scroll down to load more...</p>
            ) : allSnippets.length > 0 ? (
              <p className="py-4">No more snippets to load.</p>
            ) : (
              <p className="py-4">No snippets found.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
