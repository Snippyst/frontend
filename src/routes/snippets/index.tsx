import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { getSnippets } from '../../lib/api/snippets'
import { getTagsByIds } from '../../lib/api/tags'
import { getUsers } from '../../lib/api/users'
import type { Snippet } from '../../types/snippet'
import type { SearchToken } from '../../types/search'
import SnippetComp from '@/components/snippet/SnippetComp'
import SkeletonCard from '@/components/snippet/SkeletonCard'
import SearchInput from '@/components/snippet/SearchInput'
import { z } from 'zod'
import {
  buildSnippetsParams,
  tokensToSearchParams,
  searchParamsToTokens,
} from '@/lib/search-utils'
import { generateSEOMeta } from '@/components/SEO'

const snippetsSearchSchema = z.object({
  tags: z.array(z.string()).optional().default([]),
  userId: z.string().optional(),
  packages: z.string().optional(),
  versions: z.array(z.string()).optional().default([]),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'numberOfUpvotes'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const Route = createFileRoute('/snippets/')({
  validateSearch: snippetsSearchSchema,
  head: () => {
    return {
      meta: generateSEOMeta({
        title: 'Browse Snippets - Snippyst',
        description:
          'Browse all Typst code snippets shared by the community. Find reusable code for your next document.',
        url: 'https://snippyst.com/snippets',
        type: 'website',
      }),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const observerTarget = useRef<HTMLDivElement>(null)

  const {
    tokens: initialTokens,
    textSearch: initialTextSearch,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  } = searchParamsToTokens(searchParams)

  const [tokens, setTokens] = useState<SearchToken[]>(initialTokens)
  const [inputValue, setInputValue] = useState(initialTextSearch)
  const [textSearch, setTextSearch] = useState(initialTextSearch)
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'numberOfUpvotes'
  >(
    (initialSortBy as 'createdAt' | 'updatedAt' | 'numberOfUpvotes') ||
      'createdAt',
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (initialSortOrder as 'asc' | 'desc') || 'desc',
  )

  const { data: selectedTagsData } = useQuery({
    queryKey: [
      'tags',
      'byIds',
      tokens.filter((t) => t.type === 'tag').map((t) => t.value),
    ],
    queryFn: () =>
      getTagsByIds(tokens.filter((t) => t.type === 'tag').map((t) => t.value)),
    enabled: tokens.some((t) => t.type === 'tag'),
  })

  const { data: selectedUsersData } = useQuery({
    queryKey: [
      'users',
      'byIds',
      tokens.filter((t) => t.type === 'user').map((t) => t.value),
    ],
    queryFn: () =>
      getUsers({
        search: tokens.find((t) => t.type === 'user')?.value,
      }),
    enabled: tokens.some((t) => t.type === 'user'),
  })

  useEffect(() => {
    if (selectedTagsData) {
      setTokens((prevTokens) =>
        prevTokens.map((token) => {
          if (token.type === 'tag') {
            const tag = selectedTagsData.find((t) => t.id === token.value)
            if (tag) {
              return {
                ...token,
                displayValue: tag.name,
                metadata: { ...token.metadata, tag },
              }
            }
          }
          return token
        }),
      )
    }
  }, [selectedTagsData])

  useEffect(() => {
    if (selectedUsersData) {
      setTokens((prevTokens) =>
        prevTokens.map((token) => {
          if (token.type === 'user') {
            const user = selectedUsersData.find((u) => u.id === token.value)
            if (user) {
              return {
                ...token,
                displayValue: user.username,
                metadata: { ...token.metadata, user },
              }
            }
          }
          return token
        }),
      )
    }
  }, [selectedUsersData])

  const snippetsParams = buildSnippetsParams(
    tokens,
    textSearch,
    sortBy,
    sortOrder,
  )

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
    queryKey: ['snippets', snippetsParams],
    queryFn: ({ pageParam }) =>
      getSnippets({ page: pageParam, perPage: 10, ...snippetsParams }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined
    },
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

  useEffect(() => {
    const urlParams = tokensToSearchParams(
      tokens,
      textSearch,
      sortBy,
      sortOrder,
    )
    navigate({
      to: '/snippets',
      search: urlParams,
      replace: true,
    })
  }, [tokens, textSearch, sortBy, sortOrder, navigate])

  const handleTokenAdd = (token: SearchToken) => {
    setTokens((prev) => [...prev, token])
    setInputValue('')
  }

  const handleTokenRemove = (index: number) => {
    setTokens((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value === '' && textSearch) {
      setTextSearch('')
    }
  }

  const handleTextSearch = (text: string) => {
    setTextSearch(text)
    setInputValue(text)
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

  return (
    <div className="container mx-auto px-4 pb-8">
      <h1 className="text-3xl font-bold mb-3">Snippets</h1>

      <div className="mb-3">
        <SearchInput
          tokens={tokens}
          onTokenAdd={handleTokenAdd}
          onTokenRemove={handleTokenRemove}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onTextSearch={handleTextSearch}
          currentTextSearch={textSearch}
        />
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="sortBy"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'createdAt' | 'updatedAt' | 'numberOfUpvotes',
              )
            }
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="numberOfUpvotes">Upvotes</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="sortOrder"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Order:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
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
