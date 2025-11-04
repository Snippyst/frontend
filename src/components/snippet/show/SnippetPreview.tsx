import { useState, useEffect } from 'react'
import { useSnippetZoom } from '@/hooks/useSnippetZoom'
import { PaintBucket, Grid3x3, RotateCcw } from 'lucide-react'
import DownloadButton from '../DownloadButton'
import type { Snippet } from '@/types/snippet'

interface SnippetPreviewProps {
  snippet: Snippet
  viewMode: 'split' | 'stacked'
  layoutMode?: 'code' | 'preview'
  onWidthChange?: (width: number) => void
}

export default function SnippetPreview({
  snippet,
  viewMode,
  layoutMode = 'code',
  onWidthChange,
}: SnippetPreviewProps) {
  const [previewWidth, setPreviewWidth] = useState<number | null>(() => {
    if (viewMode === 'stacked') return null
    if (layoutMode === 'code') return null

    // TODO: After hydration this should be recalculated to ensure correct size with Math.min()
    if (typeof window === 'undefined') return 600

    return Math.min(window.innerWidth * 0.5, 800)
  })
  const [previewHeight, setPreviewHeight] = useState(
    viewMode === 'stacked' ? 500 : 760,
  )
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [startDims, setStartDims] = useState({ w: 0, h: 0 })
  const [useWhiteBackground, setUseWhiteBackground] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('snippetPreviewBackground')
    return saved === 'white'
  })

  useEffect(() => {
    localStorage.setItem(
      'snippetPreviewBackground',
      useWhiteBackground ? 'white' : 'gray',
    )
  }, [useWhiteBackground])

  const {
    scale,
    position,
    isDragging,
    containerRef,
    objectRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetZoom,
  } = useSnippetZoom(snippet.image, viewMode)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (layoutMode === 'code' && viewMode === 'split') return
    if (!containerRef.current?.parentElement) return

    const rect = containerRef.current.parentElement.getBoundingClientRect()
    setIsResizing(true)
    setResizeStart({ x: e.clientX, y: e.clientY })
    setStartDims({ w: rect.width, h: rect.height })
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth =
        viewMode === 'stacked'
          ? Math.min(window.innerWidth, 1216)
          : Math.min(window.innerWidth * 0.6, 800)
      const maxHeight = viewMode === 'stacked' ? 600 : 960

      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      const minWidth = viewMode === 'stacked' ? 400 : 400
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startDims.w + deltaX),
      )
      const newHeight = Math.max(300, Math.min(maxHeight, startDims.h + deltaY))

      setPreviewWidth(newWidth)
      setPreviewHeight(newHeight)
      onWidthChange?.(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, startDims, onWidthChange, viewMode])

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm
        border border-gray-200 dark:border-gray-700 overflow-hidden flex
        flex-col"
      style={{
        width:
          previewWidth !== null
            ? `${previewWidth}px`
            : viewMode === 'stacked' || layoutMode === 'code'
              ? '100%'
              : undefined,
        cursor: isResizing ? 'nwse-resize' : undefined,
      }}
    >
      <div
        className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200
        dark:border-gray-700 px-4 py-2 flex items-center
        justify-between"
      >
        <span
          className="text-sm font-medium text-gray-700
          dark:text-gray-300"
        >
          Preview
        </span>
        <div className="flex items-center gap-2">
          <DownloadButton snippet={snippet} type="svg" format="small" />
          <DownloadButton snippet={snippet} type="png" format="small" />
          <button
            onClick={() => setUseWhiteBackground(!useWhiteBackground)}
            className="p-1.5 bg-white dark:bg-gray-700 border
              border-gray-300 dark:border-gray-600 rounded
              hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700
              dark:text-gray-300 transition-colors"
            title={
              useWhiteBackground
                ? 'Switch to gray background'
                : 'Switch to white background'
            }
            aria-label="Toggle background color"
          >
            {useWhiteBackground ? (
              <Grid3x3 className="w-4 h-4" />
            ) : (
              <PaintBucket className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 bg-white dark:bg-gray-700 border
              border-gray-300 dark:border-gray-600 rounded
              hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700
              dark:text-gray-300 transition-colors"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${useWhiteBackground ? 'bg-white dark:bg-white' : 'bg-gray-250 dark:bg-gray-100/95'}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          height: `${previewHeight}px`,
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px)
              scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="inline-block"
        >
          <object
            ref={objectRef}
            data={snippet.image}
            type="image/svg+xml"
            className="max-w-none"
            style={{
              pointerEvents: 'none',
              filter: useWhiteBackground
                ? ''
                : 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))',
            }}
          >
            <img
              src={snippet.image}
              alt={snippet.title}
              className="max-w-none"
              draggable={false}
              style={{
                pointerEvents: 'none',
                filter: useWhiteBackground
                  ? ''
                  : 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))',
              }}
            />
          </object>
        </div>
      </div>
      {!(layoutMode === 'code' && viewMode === 'split') && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4
            bg-linear-to-tl from-blue-400 to-transparent
            dark:from-blue-500 cursor-nwse-resize hover:from-blue-500
            dark:hover:from-blue-600 transition-colors"
          style={{ userSelect: 'none' }}
        />
      )}
    </div>
  )
}
