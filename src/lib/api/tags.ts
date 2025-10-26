import { getApiUrl } from '../api-config'
import type { TagResponse, Tag } from '../../types/tags'

export interface GetTagsParams {
  page?: number
  perPage?: number
  search?: string
}

export async function getTags(
  params: GetTagsParams = {},
): Promise<TagResponse> {
  const { page = 1, perPage = 20, search } = params

  const url = new URL(getApiUrl('/tags'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('perPage', String(perPage))
  if (search) {
    url.searchParams.set('search', search)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`)
  }

  return response.json()
}

export interface CreateTagData {
  name: string
  description?: string
}

export async function createTag(data: CreateTagData): Promise<Tag> {
  const response = await fetch(getApiUrl('/tags/create'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to create tag: ${response.statusText}`,
    )
  }

  return response.json()
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) {
    return []
  }

  const response = await fetch(getApiUrl('/tags/multiple'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`)
  }

  return response.json()
}
