import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface UseSnippetZoomReturn {
  scale: number
  position: Position
  isDragging: boolean
  containerRef: RefObject<HTMLDivElement | null>
  objectRef: RefObject<HTMLObjectElement | null>
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  resetZoom: () => void
}

export function useSnippetZoom(
  imageUrl: string,
  viewMode: 'split' | 'stacked',
): UseSnippetZoomReturn {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const objectRef = useRef<HTMLObjectElement | null>(null)
  const dragStartRef = useRef<Position>({ x: 0, y: 0 })
  const hasFittedRef = useRef(false)

  const fitToContainer = useCallback(() => {
    const container = containerRef.current
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
        setScale(newScale)
        setPosition({
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
  }, [])

  useEffect(() => {
    hasFittedRef.current = false

    const obj = objectRef.current
    if (!obj) return

    const attemptFit = () => {
      if (!hasFittedRef.current) fitToContainer()
    }

    const timeoutId = setTimeout(attemptFit, 150)
    const intervalId = setInterval(() => attemptFit(), 150)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [imageUrl, viewMode, fitToContainer])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = containerRef.current
      if (!container?.contains(e.target as Node)) return

      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      const worldX = (cursorX - position.x) / scale
      const worldY = (cursorY - position.y) / scale

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor))
      const newPosition = {
        x: cursorX - worldX * newScale,
        y: cursorY - worldY * newScale,
      }

      setScale(newScale)
      setPosition(newPosition)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [scale, position])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    },
    [position],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      })
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetZoom = useCallback(() => {
    hasFittedRef.current = false
    fitToContainer()
  }, [fitToContainer])

  return {
    scale,
    position,
    isDragging,
    containerRef,
    objectRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoom,
  }
}
