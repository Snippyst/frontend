import { useState, useEffect } from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { WrapText, UnfoldHorizontal } from 'lucide-react'
import Editor from '@monaco-editor/react'
import type { Snippet } from '@/types/snippet'

interface SnippetCodeProps {
  snippet: Snippet
}

function getContentWithoutImports(content: string): string {
  const lines = content.split('\n')
  const firstNonImportIndex = lines.findIndex(
    (line) => line.trim() && !line.trim().startsWith('#import'),
  )
  return lines.slice(firstNonImportIndex).join('\n')
}

function getCopyRecommendationContent(
  content: string,
  recommendation: string,
): string {
  if (!recommendation) return content
  const match = recommendation.match(/(\d+):(\d+)-(\d+):(\d+)/)
  if (!match) return content

  const startLine = parseInt(match[1], 10) - 1
  const startChar = parseInt(match[2], 10) - 1
  const endLine = parseInt(match[3], 10) - 1
  const endChar = parseInt(match[4], 10)

  const lines = content.split('\n')

  if (startLine === endLine) {
    return lines[startLine].substring(startChar, endChar)
  }

  const result = []
  result.push(lines[startLine].substring(startChar))

  for (let i = startLine + 1; i < endLine; i++) {
    result.push(lines[i])
  }

  result.push(lines[endLine].substring(0, endChar))

  return result.join('\n')
}

const LINEWRAP_STORAGE_KEY = 'snippetCodeLineWrap'

export default function SnippetCode({ snippet }: SnippetCodeProps) {
  const { copyStatus, copyToClipboard } = useCopyToClipboard()
  const [lineWrap, setLineWrap] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(LINEWRAP_STORAGE_KEY)
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(LINEWRAP_STORAGE_KEY, lineWrap.toString())
  }, [lineWrap])

  if (!snippet.content) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Code
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLineWrap(!lineWrap)}
            title={lineWrap ? 'Disable line wrap' : 'Enable line wrap'}
            className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            {lineWrap ? (
              <WrapText className="w-3.5 h-3.5" />
            ) : (
              <UnfoldHorizontal className="w-3.5 h-3.5" />
            )}
          </button>
          {copyStatus && (
            <span className="text-xs text-green-600 dark:text-green-400">
              {copyStatus} copied!
            </span>
          )}
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
        <button
          onClick={() => copyToClipboard(snippet.content!, 'All')}
          title="Copies the entire snippet content"
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
        >
          Copy
        </button>

        <button
          onClick={() =>
            copyToClipboard(
              getContentWithoutImports(snippet.content!),
              'Content',
            )
          }
          title="Copies the snippet content without any import statements at the top"
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
        >
          Copy content
        </button>

        {snippet.copyRecommendation && (
          <button
            onClick={() =>
              copyToClipboard(
                getCopyRecommendationContent(
                  snippet.content!,
                  snippet.copyRecommendation!,
                ),
                'Recommendation',
              )
            }
            title="Copies the recommended lines for copying. This value is set by the snippet author."
            className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded transition-colors text-blue-700 dark:text-blue-300"
          >
            Copy recommended
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          value={snippet.content}
          language={undefined}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            wordWrap: lineWrap ? 'on' : 'off',
          }}
        />
      </div>
    </div>
  )
}
