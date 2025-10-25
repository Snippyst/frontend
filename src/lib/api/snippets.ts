import { getApiUrl } from '../api-config'
import type { SnippetsResponse, Snippet } from '../../types/snippet'

export interface GetSnippetsParams {
  page?: number
  perPage?: number
  tags?: string[]
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
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
}

export async function getSnippets(
  params: GetSnippetsParams = {},
): Promise<SnippetsResponse> {
  const { page = 1, perPage = 20, tags = [] } = params

  const url = new URL(getApiUrl('/snippets'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('perPage', String(perPage))
  if (tags.length > 0) {
    tags.forEach((tag) => url.searchParams.append('tags[]', tag))
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
    throw new Error(`Failed to fetch snippet: ${response.statusText}`)
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
