import { useEffect, useRef, RefObject, useCallback } from 'react'
import { useZoomAndPan } from './useZoomAndPan'

interface UseSnippetZoomReturn {
  scale: number
  position: { x: number; y: number }
  isDragging: boolean
  containerRef: RefObject<HTMLDivElement | null>
  objectRef: RefObject<HTMLObjectElement | null>
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: () => void
  resetZoom: () => void
}

export function useSnippetZoom(
  imageUrl: string,
  viewMode: 'split' | 'stacked',
): UseSnippetZoomReturn {
  const zoomAndPan = useZoomAndPan()
  const objectRef = useRef<HTMLObjectElement | null>(null)
  const hasFittedRef = useRef(false)

  const fitToContainer = useCallback(() => {
    const container = zoomAndPan.containerRef.current
    const obj = objectRef.current

    if (!container || !obj) return false

    const { clientWidth: cw, clientHeight: ch } = container

    if (!cw || !ch) return false

    try {
      const objWidth =
        (obj as any).naturalWidth || (obj as any).width || obj.clientWidth
      const objHeight =
        (obj as any).naturalHeight || (obj as any).height || obj.clientHeight

      if (objWidth > 0 && objHeight > 0) {
        const newScale = Math.min(cw / objWidth, ch / objHeight) * 0.95
        zoomAndPan.setScale(newScale)
        zoomAndPan.setPosition({
          x: (cw - objWidth * newScale) / 2,
          y: (ch - objHeight * newScale) / 2,
        })
        hasFittedRef.current = true
        return true
      }
    } catch (e) {
      console.error('fitToContainer error:', e)
    }

    return false
  }, [zoomAndPan.setScale, zoomAndPan.setPosition, zoomAndPan.containerRef])

  useEffect(() => {
    hasFittedRef.current = false

    const obj = objectRef.current
    if (!obj) return

    const attemptFit = () => {
      if (!hasFittedRef.current) {
        const success = fitToContainer()
        if (success) {
          clearInterval(intervalId)
        }
      }
    }

    const timeoutId = setTimeout(attemptFit, 150)
    const intervalId = setInterval(attemptFit, 150)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [imageUrl, viewMode, fitToContainer])

  const resetZoom = useCallback(() => {
    hasFittedRef.current = false
    fitToContainer()
  }, [fitToContainer])

  return {
    ...zoomAndPan,
    objectRef,
    resetZoom,
  }
}
