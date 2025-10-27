import type { SearchToken } from '../types/search'
import type { GetSnippetsParams } from '../lib/api/snippets'

export function buildSnippetsParams(
  tokens: SearchToken[],
  textSearch: string,
  sortBy?: 'createdAt' | 'updatedAt' | 'numberOfUpvotes',
  sortOrder?: 'asc' | 'desc',
): Omit<GetSnippetsParams, 'page' | 'perPage'> {
  const params: Omit<GetSnippetsParams, 'page' | 'perPage'> = {}

  const tagTokens = tokens.filter((t) => t.type === 'tag')
  if (tagTokens.length > 0) {
    params.tags = tagTokens.map((t) => t.value)
  }

  const userToken = tokens.find((t) => t.type === 'user')
  if (userToken) {
    params.userId = userToken.value
  }

  const packageTokens = tokens.filter((t) => t.type === 'package')
  if (packageTokens.length > 0) {
    params.packages = packageTokens.map((t) => ({
      namespace: t.metadata?.namespace || '',
      name: t.metadata?.name || '',
    }))
  }

  const versionTokens = tokens.filter((t) => t.type === 'version')
  if (versionTokens.length > 0) {
    params.versions = versionTokens.map((t) => t.value)
  }

  if (textSearch.trim()) {
    params.search = textSearch.trim()
  }

  if (sortBy) {
    params.sortBy = sortBy
  }

  if (sortOrder) {
    params.sortOrder = sortOrder
  }

  return params
}

export function tokensToSearchParams(
  tokens: SearchToken[],
  textSearch: string,
  sortBy?: string,
  sortOrder?: string,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}

  const tagTokens = tokens.filter((t) => t.type === 'tag')
  if (tagTokens.length > 0) {
    params.tags = tagTokens.map((t) => t.value)
  }

  const userToken = tokens.find((t) => t.type === 'user')
  if (userToken) {
    params.userId = userToken.value
  }

  const packageTokens = tokens.filter((t) => t.type === 'package')
  if (packageTokens.length > 0) {
    params.packages = JSON.stringify(
      packageTokens.map((t) => ({
        namespace: t.metadata?.namespace,
        name: t.metadata?.name,
      })),
    )
  }

  const versionTokens = tokens.filter((t) => t.type === 'version')
  if (versionTokens.length > 0) {
    params.versions = versionTokens.map((t) => t.value)
  }

  if (textSearch.trim()) {
    params.search = textSearch.trim()
  }

  if (sortBy) {
    params.sortBy = sortBy
  }

  if (sortOrder) {
    params.sortOrder = sortOrder
  }

  return params
}

export function searchParamsToTokens(searchParams: Record<string, unknown>): {
  tokens: SearchToken[]
  textSearch: string
  sortBy?: string
  sortOrder?: string
} {
  const tokens: SearchToken[] = []
  let textSearch = ''
  let sortBy: string | undefined
  let sortOrder: string | undefined

  if (Array.isArray(searchParams.tags)) {
    searchParams.tags.forEach((tagId: string) => {
      tokens.push({
        type: 'tag',
        value: tagId,
        displayValue: tagId,
        id: tagId,
      })
    })
  }

  if (typeof searchParams.userId === 'string') {
    tokens.push({
      type: 'user',
      value: searchParams.userId,
      displayValue: searchParams.userId,
      id: searchParams.userId,
    })
  }

  if (typeof searchParams.packages === 'string') {
    try {
      const packages = JSON.parse(searchParams.packages)
      if (Array.isArray(packages)) {
        packages.forEach((pkg: { namespace?: string; name?: string }) => {
          if (pkg.namespace && pkg.name) {
            tokens.push({
              type: 'package',
              value: `${pkg.namespace}/${pkg.name}`,
              displayValue: `${pkg.namespace}/${pkg.name}`,
              metadata: {
                namespace: pkg.namespace,
                name: pkg.name,
              },
            })
          }
        })
      }
    } catch (e) {
      console.error('Failed to parse packages from URL', e)
    }
  }

  if (Array.isArray(searchParams.versions)) {
    searchParams.versions.forEach((version: string) => {
      tokens.push({
        type: 'version',
        value: version,
        displayValue: version,
      })
    })
  }

  if (typeof searchParams.search === 'string') {
    textSearch = searchParams.search
  }

  if (typeof searchParams.sortBy === 'string') {
    sortBy = searchParams.sortBy
  }

  if (typeof searchParams.sortOrder === 'string') {
    sortOrder = searchParams.sortOrder
  }

  return { tokens, textSearch, sortBy, sortOrder }
}
