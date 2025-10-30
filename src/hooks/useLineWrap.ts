import { useState } from 'react'

const STORAGE_KEY = 'snippetLineWrap'

const isBrowser = typeof window !== 'undefined'

function getInitialLineWrap(): boolean {
  if (!isBrowser) return false
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'true'
}

export function useLineWrap() {
  const [lineWrap, setLineWrapState] = useState<boolean>(getInitialLineWrap)

  const setLineWrap = (enabled: boolean) => {
    setLineWrapState(enabled)
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, enabled.toString())
    }
  }

  return { lineWrap, setLineWrap }
}
