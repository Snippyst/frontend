import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { createSnippet } from '../../lib/api/snippets'
import {
  useTags,
  usePackageDetection,
  useCopyRecommendation,
  useTypstyleFormatter,
} from '../../hooks'
import {
  BasicInformation,
  CodeEditorSection,
  PackagesList,
  SubmitSection,
  VersionSelector,
} from '../../components/snippet/create'
import { z } from 'zod'
import { AVAILABLE_TYPST_VERSIONS } from '../../lib/constants/versions'

const FORM_STATE_KEY = 'snippetFormState'

const snippetNewSearchSchema = z.object({
  prefillTagName: z.string().optional(),
})

export const Route = createFileRoute('/snippets/new')({
  validateSearch: snippetNewSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const { prefillTagName } = Route.useSearch()
  const [tagSearch, setTagSearch] = useState('')
  const { tags: availableTags, isLoading: loadingTags } = useTags(tagSearch)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const getSavedFormState = () => {
    try {
      const saved = sessionStorage.getItem(FORM_STATE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to parse saved form state:', e)
    }
    return null
  }

  const savedState = getSavedFormState()

  const form = useForm({
    defaultValues: savedState || {
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
      versions: [AVAILABLE_TYPST_VERSIONS[0]],
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const formattedCode = format(value.code)
        if (formattedCode !== null && formattedCode !== value.code) {
          form.setFieldValue('code', formattedCode)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        const codeToSubmit = formattedCode !== null ? formattedCode : value.code

        const createdSnippet = await createSnippet({
          title: value.title,
          description: value.description,
          content: codeToSubmit,
          tags: value.tags.map((tag: { id: string; name: string }) => tag.id),
          packages: value.packages,
          copyRecommendation: value.copyRecommendation,
          author: value.alternateAuthor || undefined,
          versions: value.versions,
        })
        sessionStorage.removeItem(FORM_STATE_KEY)
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

      try {
        sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(state.values))
      } catch (e) {
        console.error('Failed to save form state:', e)
      }
    })
    return unsubscribe
  }, [form.store])

  useEffect(() => {
    return () => {
      if (router.state.location.pathname !== '/tags/new') {
        sessionStorage.removeItem(FORM_STATE_KEY)
      }
    }
  }, [router.state.location.pathname])

  useEffect(() => {
    if (prefillTagName && tagSearch !== prefillTagName) {
      setTagSearch(prefillTagName)
    }
  }, [prefillTagName])

  const { detectedPackages, removePackage } = usePackageDetection(codeValue)

  const {
    copyRecommendation,
    setCopyRangeFromSelection,
    clearCopyRecommendation,
    setEditorReference,
  } = useCopyRecommendation()

  const { format, isFormatting, formatError } = useTypstyleFormatter()

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

  const handleFormat = () => {
    const currentCode = form.getFieldValue('code')
    const formatted = format(currentCode)
    if (formatted !== null) {
      form.setFieldValue('code', formatted)
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
          onCreateTag={() =>
            navigate({ to: '/tags/new', search: { prefillTagName: tagSearch } })
          }
        />

        <form.Field name="versions">
          {(field: any) => (
            <VersionSelector
              selectedVersions={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <CodeEditorSection
          form={form}
          viewMode={viewMode}
          copyRecommendation={copyRecommendation}
          onEditorMount={setEditorReference}
          onViewModeChange={setViewMode}
          onSetCopyRecommendation={handleSetCopyRecommendation}
          onClearCopyRecommendation={clearCopyRecommendation}
          onFormat={handleFormat}
          isFormatting={isFormatting}
          formatError={formatError}
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
