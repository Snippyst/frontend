import { downloadPng, downloadSvg } from '@/lib/download'
import { Snippet } from '@/types/snippet'
import { Download } from 'lucide-react'
import { GrDocumentDownload } from 'react-icons/gr'
import React, { useState } from 'react'

interface DownloadButtonProps {
  snippet: Snippet
  type: 'svg' | 'png'
  format: 'small' | 'large'
}

export default function DownloadButton({
  snippet,
  type,
  format = 'large',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadSvg = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('PNG download clicked', snippet.title)
    if (!snippet.image) return

    try {
      setIsDownloading(true)
      await downloadSvg(snippet.image, snippet.title)
    } catch (err) {
      console.error('Failed to download SVG:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadPng = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!snippet.image) return

    try {
      setIsDownloading(true)
      await downloadPng(snippet.image, snippet.title)
    } catch (err) {
      console.error('Failed to download PNG:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <div>
        {format === 'small' ? (
          <button
            onClick={type === 'svg' ? handleDownloadSvg : handleDownloadPng}
            disabled={isDownloading}
            className="p-1.5 bg-white dark:bg-gray-700 border
            border-gray-300 dark:border-gray-600 rounded
            hover:bg-gray-50 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Download ${type.toUpperCase()}`}
          >
            {type === 'svg' ? (
              <Download size={16} />
            ) : (
              <GrDocumentDownload size={16} />
            )}
          </button>
        ) : (
          <button
            onClick={type === 'svg' ? handleDownloadSvg : handleDownloadPng}
            disabled={isDownloading}
            className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            {isDownloading
              ? 'Downloading...'
              : `Download ${type.toUpperCase()}`}
          </button>
        )}
      </div>
    </>
  )
}
