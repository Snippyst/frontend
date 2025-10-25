import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import Editor from '@monaco-editor/react'
import { useRef, useState, useMemo, useEffect } from 'react'
import type { editor } from 'monaco-editor'
import { TypstPreview } from '../../components/TypstPreview'
import { getTags } from '../../lib/api/tags'
import { createSnippet } from '../../lib/api/snippets'
import type { Tag } from '../../types/tags'
import MultiSelect from '../../components/ui/MultiSelect'
import {
  Columns2,
  AlignJustify,
  Info,
  X,
  Package,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/snippets/new')({
  component: RouteComponent,
})

const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const packageSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  version: z.string(),
})

const snippetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  author: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
  packages: z.array(packageSchema).optional(),
  copyRecommendation: z.string().optional(),
})

const defaultTypstCode = ``

function RouteComponent() {
  const navigate = useNavigate()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [editorValue, setEditorValue] = useState(defaultTypstCode)
  const [previewValue, setPreviewValue] = useState(defaultTypstCode)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')
  const [tagSearch, setTagSearch] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [copyRecommendation, setCopyRecommendation] = useState<string>('')
  const [removedPackages, setRemovedPackages] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      tags: [] as Array<{ id: string; name: string }>,
      alternateAuthor: '',
      code: defaultTypstCode,
      packages: [] as Array<{
        namespace: string
        name: string
        version: string
      }>,
      copyRecommendation: '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setSubmitError(null)

      const submissionData = {
        ...value,
        author: value.alternateAuthor || undefined,
      }

      const result = snippetSchema.safeParse(submissionData)
      if (!result.success) {
        setSubmitError('Please check all required fields are filled correctly.')
        setIsSubmitting(false)
        return
      }

      try {
        const createdSnippet = await createSnippet({
          title: result.data.title,
          description: result.data.description,
          content: result.data.code,
          tags: result.data.tags?.map((tag) => tag.id),
          packages: result.data.packages,
          copyRecommendation: result.data.copyRecommendation,
          author: result.data.author,
        })

        navigate({ to: `/snippets/${createdSnippet.id}` })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create snippet. Please try again.'
        setSubmitError(errorMessage)
        setIsSubmitting(false)
      }
    },
  })

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const response = await getTags({ search: tagSearch, perPage: 10 })
        setAvailableTags(response.data)
      } catch (error) {
        console.error(
          'Failed to fetch tags:',
          error instanceof Error ? error.message : error,
        )
      } finally {
        setLoadingTags(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchTags()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [tagSearch])

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value: string | undefined) => {
    const code = value || ''
    setEditorValue(code)
    setPreviewValue(code)
    form.setFieldValue('code', code)
  }

  const extractedPackages = useMemo(() => {
    const packageRegex = /^[ \t]*#?import\s+"@([^/]+)\/([^:]+):([^"]+)"/gm
    const packages: Array<{
      namespace: string
      name: string
      version: string
    }> = []
    const seen = new Set<string>()
    let match: RegExpExecArray | null

    while ((match = packageRegex.exec(editorValue)) !== null) {
      const pkgKey = `${match[1]}/${match[2]}:${match[3]}`
      if (!removedPackages.has(pkgKey) && !seen.has(pkgKey)) {
        seen.add(pkgKey)
        packages.push({
          namespace: match[1],
          name: match[2],
          version: match[3],
        })
      }
    }

    return packages
  }, [editorValue, removedPackages])

  useEffect(() => {
    form.setFieldValue('packages', extractedPackages)
  }, [extractedPackages, form])

  const handleSetCopyRecommendation = () => {
    const editor = editorRef.current
    if (!editor) return

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      alert('Please select a range in the editor first')
      return
    }

    const rangeString = `${selection.startLineNumber}:${selection.startColumn}-${selection.endLineNumber}:${selection.endColumn}`
    setCopyRecommendation(rangeString)
    form.setFieldValue('copyRecommendation', rangeString)
  }

  const handleClearCopyRecommendation = () => {
    setCopyRecommendation('')
    form.setFieldValue('copyRecommendation', '')
  }

  const handleRemovePackage = (pkg: {
    namespace: string
    name: string
    version: string
  }) => {
    const pkgKey = `${pkg.namespace}/${pkg.name}:${pkg.version}`
    setRemovedPackages((prev) => new Set(prev).add(pkgKey))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create New Snippet
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Share your Typst code with the community
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Basic Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <form.Field
                name="title"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) {
                      return 'Title is required'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="e.g., Beautiful Mathematical Equations"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="tags">
                {(field) => (
                  <div>
                    <MultiSelect
                      items={availableTags.map((tag) => ({
                        id: tag.id,
                        name: tag.name,
                        count: tag.numberOfSnippets,
                      }))}
                      selectedItems={field.state.value}
                      onSelectionChange={(newTags) =>
                        field.handleChange(
                          newTags.map((tag) => ({
                            id: tag.id,
                            name: tag.name,
                          })),
                        )
                      }
                      label="Tags"
                      searchPlaceholder="Search tags..."
                      placeholder="No tags available"
                      isLoading={loadingTags}
                      onSearch={setTagSearch}
                      showDropdown={true}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="description">
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Description
                    </label>
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={2}
                      className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="Briefly describe what this snippet does..."
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="alternateAuthor">
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Alternate Author
                      <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="Credit the original author if applicable"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <form.Field
          name="code"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return 'Code is required'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <>
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
                        onClick={handleSetCopyRecommendation}
                        className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        title="Set the current editor selection as the copy recommendation"
                      >
                        Set Copy Range
                      </button>
                      <div className="hidden lg:flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700">
                        <button
                          type="button"
                          onClick={() => setViewMode('split')}
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
                          onClick={() => setViewMode('stacked')}
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
                          onClick={handleClearCopyRecommendation}
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
                      value={editorValue}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
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
                  {field.state.meta.errors.length > 0 && (
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
                    <TypstPreview code={previewValue} />
                  </div>
                </div>
              </div>
            </>
          )}
        </form.Field>

        {extractedPackages.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Detected Packages
            </h3>
            <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
              Automatically extracted from import statements
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                >
                  <Package className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                    @{pkg.namespace}/{pkg.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    v{pkg.version}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePackage(pkg)}
                    className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    title="Remove this package"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Error creating snippet
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2 ">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              By creating a snippet, you confirm that you have the necessary
              rights to upload and distribute this content. Published snippets
              may be used by others in compiled or binary form for personal and
              commercial purposes.
            </p>
            <p>
              You may specify a license in the description. However, any license
              must not restrict the users rights to modify, distribute, or use
              the compiled output for personal or commercial purposes.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md border border-transparent bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
            >
              {isSubmitting ? 'Uploading and compiling...' : 'Create Snippet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
