import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Columns2, AlignJustify, Info, Wand2 } from 'lucide-react'
import { TypstPreview } from '../../TypstPreview'
import { snippetFormSchema } from '../../../lib/validation/snippetSchema'
import { registerTypstLanguage } from '../../../lib/monaco/typstLanguage'

interface CodeEditorSectionProps {
  form: any
  viewMode: 'split' | 'stacked'
  copyRecommendation: string
  onEditorMount: (editor: editor.IStandaloneCodeEditor) => void
  onViewModeChange: (mode: 'split' | 'stacked') => void
  onSetCopyRecommendation: () => void
  onClearCopyRecommendation: () => void
  onFormat: () => void
  isFormatting?: boolean
  formatError?: string | null
}

export function CodeEditorSection({
  form,
  viewMode,
  copyRecommendation,
  onEditorMount,
  onViewModeChange,
  onSetCopyRecommendation,
  onClearCopyRecommendation,
  onFormat,
  isFormatting = false,
  formatError = null,
}: CodeEditorSectionProps) {
  return (
    <form.Field
      name="code"
      validators={{
        onBlur: ({ value }: any) => {
          const result = snippetFormSchema.shape.code.safeParse(value)
          return result.success ? undefined : result.error.issues[0]?.message
        },
      }}
    >
      {(field: any) => (
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
                  onClick={onFormat}
                  disabled={isFormatting}
                  className="rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Format code with Typstyle"
                >
                  <Wand2 className="h-3 w-3" />
                  {isFormatting ? 'Formatting...' : 'Format'}
                </button>
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
            {formatError && (
              <div className="border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    Format error: {formatError}
                  </span>
                </div>
              </div>
            )}
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
                language="typst"
                value={field.state.value}
                onChange={(value) => field.handleChange(value || '')}
                beforeMount={(monaco) => {
                  registerTypstLanguage(monaco).catch(console.error)
                }}
                onMount={(editor, _monaco) => {
                  onEditorMount(editor)
                  editor.onDidBlurEditorText(() => {
                    field.handleBlur()
                  })
                }}
                theme="dark-plus"
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
            {field.state.meta.errors.length > 0 &&
              field.state.meta.isBlurred && (
                <div className="border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {field.state.meta.errors[0]}
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
              <TypstPreview code={field.state.value} />
            </div>
          </div>
        </div>
      )}
    </form.Field>
  )
}
