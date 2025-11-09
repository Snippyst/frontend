import { getApiUrl } from '../api-config'
import type { SnippetsResponse, Snippet } from '../../types/snippet'

export interface GetSnippetsParams {
  page?: number
  perPage?: number
  tags?: string[]
  userId?: string
  packages?: Array<{
    namespace: string
    name: string
    version?: string
  }>
  versions?: string[]
  sortBy?: 'createdAt' | 'updatedAt' | 'numberOfUpvotes'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface CreateSnippetParams {
  title: string
  description?: string
  content: string
  tags?: string[]
  packages?: Array<{
    namespace: string
    name: string
    version: string
  }>
  copyRecommendation?: string
  author?: string
  versions?: string[]
}

export interface SearchSuggestionsResponse {
  suggestions: string[]
}

export async function getSearchSuggestions(
  params: Omit<GetSnippetsParams, 'page' | 'perPage'> = {},
): Promise<SearchSuggestionsResponse> {
  const { tags = [] } = params

  const url = new URL(getApiUrl('/snippets/suggest'))

  if (tags.length > 0) {
    tags.forEach((tag) => url.searchParams.append('tags[]', tag))
  }

  if (params.userId) {
    url.searchParams.set('userId', params.userId)
  }

  if (params.packages && params.packages.length > 0) {
    params.packages.forEach((pkg) => {
      url.searchParams.append('packages[][namespace]', pkg.namespace)
      url.searchParams.append('packages[][name]', pkg.name)
      if (pkg.version) {
        url.searchParams.append('packages[][version]', pkg.version)
      }
    })
  }

  if (params.versions && params.versions.length > 0) {
    params.versions.forEach((version) => {
      url.searchParams.append('versions[]', version)
    })
  }

  if (params.search) {
    url.searchParams.set('search', params.search)
  }

  if (params.sortBy) {
    url.searchParams.set('sortBy', params.sortBy)
  }

  if (params.sortOrder) {
    url.searchParams.set('sortOrder', params.sortOrder)
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch suggestions: ${response.statusText}`)
  }

  return response.json()
}

export async function getSnippets(
  params: GetSnippetsParams = {},
): Promise<SnippetsResponse> {
  const { page = 1, perPage = 20, tags = [] } = params

  const url = new URL(getApiUrl('/snippets'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(perPage))

  if (tags.length > 0) {
    tags.forEach((tag) => url.searchParams.append('tags[]', tag))
  }

  if (params.userId) {
    url.searchParams.set('userId', params.userId)
  }

  if (params.packages && params.packages.length > 0) {
    params.packages.forEach((pkg) => {
      url.searchParams.append('packages[][namespace]', pkg.namespace)
      url.searchParams.append('packages[][name]', pkg.name)
      if (pkg.version) {
        url.searchParams.append('packages[][version]', pkg.version)
      }
    })
  }

  if (params.versions && params.versions.length > 0) {
    params.versions.forEach((version) => {
      url.searchParams.append('versions[]', version)
    })
  }

  if (params.search) {
    url.searchParams.set('search', params.search)
  }

  if (params.sortBy) {
    url.searchParams.set('sortBy', params.sortBy)
  }

  if (params.sortOrder) {
    url.searchParams.set('sortOrder', params.sortOrder)
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch snippets: ${response.statusText}`)
  }

  return response.json()
}

export async function createSnippet(
  params: CreateSnippetParams,
): Promise<Snippet> {
  const url = new URL(getApiUrl('/snippets/create'))

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to create snippet: ${(await response.json()).message}`,
    )
  }

  return response.json()
}

export async function getSnippet(id: string) {
  const url = new URL(getApiUrl(`/snippets/${id}`))

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    const error: any = new Error(
      `Failed to fetch snippet: ${response.statusText}`,
    )
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function voteSnippet(id: string, vote: boolean): Promise<void> {
  const url = new URL(getApiUrl(`/snippets/${id}/vote`))

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vote: vote }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to vote snippet: ${response.statusText}`)
  }
}

export async function deleteSnippet(id: string): Promise<void> {
  const url = new URL(getApiUrl(`/snippets/${id}/delete`))

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete snippet: ${response.statusText}`)
  }
}

export interface UpdateSnippetParams {
  title?: string
  description?: string
  content?: string
  tags?: string[]
  packages?: Array<{
    namespace: string
    name: string
    version: string
  }>
  copyRecommendation?: string
  author?: string
  versions?: string[]
}

export async function updateSnippet(
  id: string,
  params: UpdateSnippetParams,
): Promise<Snippet> {
  const url = new URL(getApiUrl(`/snippets/${id}`))

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to update snippet: ${(await response.json()).message}`,
    )
  }

  return response.json()
}

export async function getRandomSnippet(): Promise<{ id: string }> {
  const url = new URL(getApiUrl('/snippets/random'))

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch random snippet: ${response.statusText}`)
  }

  return response.json()
}
