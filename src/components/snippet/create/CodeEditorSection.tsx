import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Columns2, AlignJustify, Info } from 'lucide-react'
import { TypstPreview } from '../../TypstPreview'

interface CodeEditorSectionProps {
  code: string
  previewCode: string
  viewMode: 'split' | 'stacked'
  copyRecommendation: string
  codeError?: string
  onCodeChange: (value: string | undefined) => void
  onEditorMount: (editor: editor.IStandaloneCodeEditor) => void
  onViewModeChange: (mode: 'split' | 'stacked') => void
  onSetCopyRecommendation: () => void
  onClearCopyRecommendation: () => void
}

export function CodeEditorSection({
  code,
  previewCode,
  viewMode,
  copyRecommendation,
  codeError,
  onCodeChange,
  onEditorMount,
  onViewModeChange,
  onSetCopyRecommendation,
  onClearCopyRecommendation,
}: CodeEditorSectionProps) {
  return (
    <div
      className={`grid gap-4 ${viewMode === 'stacked' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}
    >
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Code Editor
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSetCopyRecommendation}
              className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              title="Set the current editor selection as the copy recommendation"
            >
              Set Copy Range
            </button>
            <div className="hidden lg:flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700">
              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                className={`rounded p-1.5 transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title="Split view"
              >
                <Columns2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('stacked')}
                className={`rounded p-1.5 transition-all ${
                  viewMode === 'stacked'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title="Stacked view"
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        {copyRecommendation && (
          <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Copy recommendation: {copyRecommendation}
                </span>
              </div>
              <button
                type="button"
                onClick={onClearCopyRecommendation}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        <div className="h-[400px] lg:h-[500px]">
          <Editor
            height="100%"
            value={code}
            onChange={onCodeChange}
            onMount={onEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
        {codeError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {codeError}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Preview
          </h3>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Preview may differ from final render
          </p>
        </div>
        <div className="h-[400px] lg:h-[500px]">
          <TypstPreview code={previewCode} />
        </div>
      </div>
    </div>
  )
}
