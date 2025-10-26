import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  useSnippetForm,
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
  const { formValues, updateField, handleSubmit, isSubmitting, submitError } =
    useSnippetForm()

  const [tagSearch, setTagSearch] = useState('')
  const { tags: availableTags, isLoading: loadingTags } = useTags(tagSearch)

  const { detectedPackages, removePackage } = usePackageDetection(
    formValues.code,
  )

  const {
    copyRecommendation,
    setCopyRangeFromSelection,
    clearCopyRecommendation,
    setEditorReference,
  } = useCopyRecommendation()

  const [editorValue, setEditorValue] = useState('')
  const [previewValue, setPreviewValue] = useState('')
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')

  const [titleError, setTitleError] = useState<string | undefined>()
  const [codeError, setCodeError] = useState<string | undefined>()

  useEffect(() => {
    updateField('packages', detectedPackages)
  }, [detectedPackages, updateField])

  useEffect(() => {
    updateField('copyRecommendation', copyRecommendation)
  }, [copyRecommendation, updateField])

  const handleEditorChange = (value: string | undefined) => {
    const code = value || ''
    setEditorValue(code)
    setPreviewValue(code)
    updateField('code', code)

    if (codeError && code.trim().length > 0) {
      setCodeError(undefined)
    }
  }

  const handleSetCopyRecommendation = () => {
    const success = setCopyRangeFromSelection()
    if (!success) {
      alert('Please select a range in the editor first')
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setTitleError(undefined)
    setCodeError(undefined)

    let hasError = false

    if (!formValues.title || formValues.title.trim().length === 0) {
      setTitleError('Title is required')
      hasError = true
    }

    if (!formValues.code || formValues.code.trim().length === 0) {
      setCodeError('Code is required')
      hasError = true
    }

    if (hasError) {
      return
    }

    await handleSubmit()
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

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <BasicInformation
          title={formValues.title}
          description={formValues.description}
          tags={formValues.tags}
          alternateAuthor={formValues.alternateAuthor}
          availableTags={availableTags}
          loadingTags={loadingTags}
          titleError={titleError}
          onTitleChange={(value) => {
            updateField('title', value)
            if (titleError && value.trim().length > 0) {
              setTitleError(undefined)
            }
          }}
          onDescriptionChange={(value) => updateField('description', value)}
          onTagsChange={(tags) => updateField('tags', tags)}
          onAlternateAuthorChange={(value) =>
            updateField('alternateAuthor', value)
          }
          onTagSearch={setTagSearch}
        />

        <CodeEditorSection
          code={editorValue}
          previewCode={previewValue}
          viewMode={viewMode}
          copyRecommendation={copyRecommendation}
          codeError={codeError}
          onCodeChange={handleEditorChange}
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
          isSubmitting={isSubmitting}
          submitError={submitError}
          onCancel={() => window.history.back()}
        />
      </form>
    </div>
  )
}
