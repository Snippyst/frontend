import { useState } from 'react'

type LayoutMode = 'code' | 'preview'

const STORAGE_KEY = 'snippetLayoutMode'

const isBrowser = typeof window !== 'undefined'

function getInitialLayoutMode(): LayoutMode {
  if (!isBrowser) return 'code'
  const saved = localStorage.getItem(STORAGE_KEY)
  return (saved as LayoutMode) || 'code'
}

export function useLayoutMode() {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(getInitialLayoutMode)

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode)
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
  }

  return { layoutMode, setLayoutMode }
}
