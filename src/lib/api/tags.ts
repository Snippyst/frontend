import { getApiUrl } from '../api-config'
import type { TagResponse } from '../../types/tags'

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
