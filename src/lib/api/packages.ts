import { getApiUrl } from '../api-config'
import type { PaginationMeta } from '../../types/common'

export interface Package {
  namespace: string
  name: string
}

export interface PackagesResponse {
  data: Package[]
  meta: PaginationMeta
}

export interface GetPackagesParams {
  page?: number
  perPage?: number
  namespace?: string
  name?: string
}

export async function getPackages(
  params: GetPackagesParams = {},
): Promise<PackagesResponse> {
  const { page = 1, perPage = 20, namespace, name } = params

  const url = new URL(getApiUrl('/packages'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(perPage))
  if (namespace) {
    url.searchParams.set('namespace', namespace)
  }
  if (name) {
    url.searchParams.set('name', name)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`)
  }

  return response.json()
}
