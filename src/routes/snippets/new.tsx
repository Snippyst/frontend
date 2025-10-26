import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { createSnippet } from '../../lib/api/snippets'
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

export const Route = createFileRoute('/snippets/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [tagSearch, setTagSearch] = useState('')
  const { tags: availableTags, isLoading: loadingTags } = useTags(tagSearch)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      code: '',
      tags: [] as Array<{ id: string; name: string }>,
      alternateAuthor: '',
      packages: [] as Array<{
        namespace: string
        name: string
        version: string
      }>,
      copyRecommendation: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const createdSnippet = await createSnippet({
          title: value.title,
          description: value.description,
          content: value.code,
          tags: value.tags.map((tag) => tag.id),
          packages: value.packages,
          copyRecommendation: value.copyRecommendation,
          author: value.alternateAuthor || undefined,
        })
        navigate({ to: `/snippets/${createdSnippet.id}` })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create snippet. Please try again.'
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
        <BasicInformation
          form={form}
          availableTags={availableTags}
          loadingTags={loadingTags}
          onTagSearch={setTagSearch}
          onCreateTag={() => navigate({ to: '/tags/new' })}
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
          onCancel={() => window.history.back()}
        />
      </form>
    </div>
  )
}
