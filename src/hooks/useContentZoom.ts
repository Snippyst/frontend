import { useCallback } from 'react'
import { useZoomAndPan } from './useZoomAndPan'

interface UseContentZoomReturn {
  scale: number
  position: { x: number; y: number }
  isDragging: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: () => void
  resetZoom: () => void
}

export function useContentZoom(): UseContentZoomReturn {
  const zoomAndPan = useZoomAndPan()

  const resetZoom = useCallback(() => {
    zoomAndPan.setScale(1)
    zoomAndPan.setPosition({ x: 0, y: 0 })
  }, [zoomAndPan])

  return {
    ...zoomAndPan,
    resetZoom,
  }
}
