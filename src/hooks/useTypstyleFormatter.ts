import { useState, useCallback, useEffect, useRef } from 'react'
import type { format as formatFn } from '@typstyle/typstyle-wasm-bundler'

let formatFunction: typeof formatFn | null = null
let initializationPromise: Promise<typeof formatFn> | null = null

async function initializeTypstyle(): Promise<typeof formatFn> {
  if (formatFunction) {
    return formatFunction
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    const module = await import('@typstyle/typstyle-wasm-bundler')
    formatFunction = module.format
    return formatFunction
  })()

  return initializationPromise
}

export interface UseTypstyleFormatterReturn {
  format: (code: string) => string | null
  isFormatting: boolean
  isInitialized: boolean
  formatError: string | null
}

export function useTypstyleFormatter(): UseTypstyleFormatterReturn {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)
  const [formatError, setFormatError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    initializeTypstyle()
      .then(() => {
        if (isMountedRef.current) {
          setIsInitialized(true)
        }
      })
      .catch((err) => {
        console.error('Failed to initialize typstyle:', err)
        if (isMountedRef.current) {
          setFormatError('Failed to initialize formatter')
        }
      })

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const format = useCallback(
    (code: string): string | null => {
      if (!isInitialized || !formatFunction) {
        setFormatError('Formatter not initialized')
        return null
      }

      setIsFormatting(true)
      setFormatError(null)

      try {
        const formatted = formatFunction(code, {})
        setIsFormatting(false)
        return formatted
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to format code'
        console.error('Formatting error:', error)
        setFormatError(errorMessage)
        setIsFormatting(false)
        return null
      }
    },
    [isInitialized],
  )

  return {
    format,
    isFormatting,
    isInitialized,
    formatError,
  }
}
