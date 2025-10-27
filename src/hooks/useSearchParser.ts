import { useState, useCallback } from 'react'
import type { SearchToken } from '../types/search'

export function useSearchParser() {
  const [tokens, setTokens] = useState<SearchToken[]>([])
  const [inputValue, setInputValue] = useState('')

  const addToken = useCallback((token: SearchToken) => {
    setTokens((prev) => [...prev, token])
    setInputValue('')
  }, [])

  const removeToken = useCallback((index: number) => {
    setTokens((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearTokens = useCallback(() => {
    setTokens([])
    setInputValue('')
  }, [])

  const parseInput = useCallback(
    (
      input: string,
    ): {
      prefix: string | null
      query: string
    } => {
      const prefixMatch = input.match(/^(tag|user|package|version):(.*)/)
      if (prefixMatch) {
        return {
          prefix: prefixMatch[1],
          query: prefixMatch[2].trim(),
        }
      }
      return {
        prefix: null,
        query: input,
      }
    },
    [],
  )

  return {
    tokens,
    inputValue,
    setInputValue,
    addToken,
    removeToken,
    clearTokens,
    parseInput,
  }
}
