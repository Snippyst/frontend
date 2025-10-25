import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getSnippet } from '@/lib/api/snippets'

export function useSnippetLoader(id: string) {
  const navigate = useNavigate()

  const {
    data: snippet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['snippet', id],
    queryFn: () => getSnippet(id),
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  useEffect(() => {
    if (isError) {
      navigate({ to: '/snippets' })
    }
  }, [isError, navigate])

  return { snippet, isLoading, isError }
}
