import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface UseZoomAndPanReturn {
  scale: number
  position: Position
  isDragging: boolean
  containerRef: RefObject<HTMLDivElement | null>
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: () => void
  setScale: (scale: number) => void
  setPosition: (position: Position) => void
}

export function useZoomAndPan(): UseZoomAndPanReturn {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<Position>({ x: 0, y: 0 })
  const lastTouchDistanceRef = useRef<number | null>(null)
  const lastTouchMidpointRef = useRef<Position | null>(null)

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

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchMidpoint = (touches: React.TouchList): Position | null => {
    if (touches.length < 2) return null
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true)
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        }
        lastTouchDistanceRef.current = null
        lastTouchMidpointRef.current = null
      } else if (e.touches.length === 2) {
        setIsDragging(false)
        lastTouchDistanceRef.current = getTouchDistance(e.touches)
        lastTouchMidpointRef.current = getTouchMidpoint(e.touches)
      }
    },
    [position],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && isDragging) {
        setPosition({
          x: e.touches[0].clientX - dragStartRef.current.x,
          y: e.touches[0].clientY - dragStartRef.current.y,
        })
      } else if (e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches)
        const currentMidpoint = getTouchMidpoint(e.touches)

        if (
          lastTouchDistanceRef.current !== null &&
          currentDistance !== null &&
          lastTouchMidpointRef.current !== null &&
          currentMidpoint !== null &&
          containerRef.current
        ) {
          const rect = containerRef.current.getBoundingClientRect()
          const midpointX = currentMidpoint.x - rect.left
          const midpointY = currentMidpoint.y - rect.top

          const worldX = (midpointX - position.x) / scale
          const worldY = (midpointY - position.y) / scale

          const zoomFactor = currentDistance / lastTouchDistanceRef.current
          const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor))
          const newPosition = {
            x: midpointX - worldX * newScale,
            y: midpointY - worldY * newScale,
          }

          setScale(newScale)
          setPosition(newPosition)
        }

        lastTouchDistanceRef.current = currentDistance
        lastTouchMidpointRef.current = currentMidpoint
      }
    },
    [isDragging, scale, position],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    lastTouchDistanceRef.current = null
    lastTouchMidpointRef.current = null
  }, [])

  return {
    scale,
    position,
    isDragging,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setScale,
    setPosition,
  }
}
