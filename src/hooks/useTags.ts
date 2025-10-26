import { useState, useEffect } from 'react'
import { getTags } from '../lib/api/tags'
import type { Tag } from '../types/tags'

export function useTags(searchQuery: string, perPage: number = 10) {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getTags({ search: searchQuery, perPage })
        setTags(response.data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch tags'
        setError(errorMessage)
        console.error('Failed to fetch tags:', errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchTags()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, perPage])

  return { tags, isLoading, error }
}
