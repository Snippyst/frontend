import { useState } from 'react'

type ViewMode = 'split' | 'stacked'

const STORAGE_KEY = 'snippetViewMode'

const isBrowser = typeof window !== 'undefined'

function getInitialViewMode(): ViewMode {
  if (!isBrowser) return 'split'
  const saved = localStorage.getItem(STORAGE_KEY)
  return (saved as ViewMode) || 'split'
}

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialViewMode)

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
  }

  return { viewMode, setViewMode }
}
