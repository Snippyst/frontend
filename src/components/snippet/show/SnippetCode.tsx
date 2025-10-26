import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
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

export default function SnippetCode({ snippet }: SnippetCodeProps) {
  const { copyStatus, copyToClipboard } = useCopyToClipboard()

  if (!snippet.content) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Code
        </span>
        {copyStatus && (
          <span className="text-xs text-green-600 dark:text-green-400">
            {copyStatus} copied!
          </span>
        )}
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

      <div className="max-h-128 overflow-auto bg-gray-900 dark:bg-black text-gray-100">
        <pre className="p-4 text-xs ">{snippet.content}</pre>
      </div>
    </div>
  )
}
