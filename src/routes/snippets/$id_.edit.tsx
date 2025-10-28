import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { getSnippet, updateSnippet } from '../../lib/api/snippets'
import {
  useTags,
  usePackageDetection,
  useCopyRecommendation,
} from '../../hooks'
import {
  BasicInformation,
  CodeEditorSection,
  PackagesList,
  SubmitSection,
} from '../../components/snippet/create'
import type { Tag } from '../../types/tags'

export const Route = createFileRoute('/snippets/$id_/edit')({
  loader: async ({ context, params }) => {
    return await context.queryClient.fetchQuery({
      queryKey: ['snippet', params.id],
      queryFn: () => getSnippet(params.id),
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const snippet = Route.useLoaderData()
  const navigate = useNavigate()
  const params = Route.useParams()
  const [tagSearch, setTagSearch] = useState('')
  const { tags: availableTags, isLoading: loadingTags } = useTags(tagSearch)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: snippet.title,
      description: snippet.description || '',
      code: snippet.content || '',
      tags: snippet.tags.map((tag: Tag) => ({ id: tag.id, name: tag.name })),
      alternateAuthor: snippet.author || '',
      packages: snippet.packages || [],
      copyRecommendation: snippet.copyRecommendation || '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const changes: Record<string, any> = {}

        if (value.title !== snippet.title) {
          changes.title = value.title
        }
        if (value.description !== (snippet.description || '')) {
          changes.description = value.description
        }
        if (value.code !== (snippet.content || '')) {
          changes.content = value.code
        }
        const currentTagIds = snippet.tags.map((tag: Tag) => tag.id).sort()
        const newTagIds = value.tags.map((tag: { id: string }) => tag.id).sort()
        if (JSON.stringify(currentTagIds) !== JSON.stringify(newTagIds)) {
          changes.tags = value.tags.map((tag: { id: string }) => tag.id)
        }
        if (
          JSON.stringify(value.packages) !== JSON.stringify(snippet.packages || [])
        ) {
          changes.packages = value.packages
        }
        if (
          value.copyRecommendation !== (snippet.copyRecommendation || '')
        ) {
          changes.copyRecommendation = value.copyRecommendation
        }
        if (value.alternateAuthor !== (snippet.author || '')) {
          changes.author = value.alternateAuthor || undefined
        }

        if (Object.keys(changes).length === 0) {
          navigate({ to: '/snippets/$id', params: { id: params.id } })
          return
        }

        await updateSnippet(params.id, changes)
        navigate({ to: '/snippets/$id', params: { id: params.id } })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update snippet. Please try again.'
        setSubmitError(errorMessage)
      }
    },
  })

  const [codeValue, setCodeValue] = useState('')

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const state = form.store.state
      setCodeValue(state.values.code)
    })
    return unsubscribe
  }, [form.store])

  const { detectedPackages, removePackage } = usePackageDetection(codeValue)

  const {
    copyRecommendation,
    setCopyRangeFromSelection,
    clearCopyRecommendation,
    setEditorReference,
  } = useCopyRecommendation()

  useEffect(() => {
    form.setFieldValue('packages', detectedPackages)
  }, [detectedPackages])

  useEffect(() => {
    form.setFieldValue('copyRecommendation', copyRecommendation)
  }, [copyRecommendation])

  const handleSetCopyRecommendation = () => {
    const success = setCopyRangeFromSelection()
    if (!success) {
      alert('Please select a range in the editor first')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit Snippet
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your Typst snippet
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
        <BasicInformation
          form={form}
          availableTags={availableTags}
          loadingTags={loadingTags}
          onTagSearch={setTagSearch}
          onCreateTag={() =>
            navigate({ to: '/tags/new', search: { prefillTagName: tagSearch } })
          }
        />

        <CodeEditorSection
          form={form}
          viewMode={viewMode}
          copyRecommendation={copyRecommendation}
          onEditorMount={setEditorReference}
          onViewModeChange={setViewMode}
          onSetCopyRecommendation={handleSetCopyRecommendation}
          onClearCopyRecommendation={clearCopyRecommendation}
        />

        <PackagesList
          packages={detectedPackages}
          onRemovePackage={removePackage}
        />

        <SubmitSection
          form={form}
          submitError={submitError}
          onCancel={() => navigate({ to: '/snippets/$id', params: { id: params.id } })}
          isEdit={true}
        />
      </form>
    </div>
  )
}
