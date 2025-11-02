import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { getSnippet, updateSnippet } from '../../lib/api/snippets'
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
import type { Tag } from '../../types/tags'
import { AVAILABLE_TYPST_VERSIONS } from '../../lib/constants/versions'

const FORM_STATE_KEY_PREFIX = 'snippetEditFormState_'

export const Route = createFileRoute('/snippets/$id_/edit')({
  loader: async ({ params }) => {
    return await getSnippet(params.id)
  },
  gcTime: 0,
  component: RouteComponent,
})

function RouteComponent() {
  const snippet = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()
  const params = Route.useParams()
  const queryClient = useQueryClient()
  const [tagSearch, setTagSearch] = useState('')
  const { tags: availableTags, isLoading: loadingTags } = useTags(tagSearch)
  const [viewMode, setViewMode] = useState<'split' | 'stacked'>('split')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const FORM_STATE_KEY = `${FORM_STATE_KEY_PREFIX}${params.id}`

  const form = useForm({
    defaultValues: {
      title: snippet.title,
      description: snippet.description || '',
      code: snippet.content || '',
      tags: snippet.tags.map((tag: Tag) => ({ id: tag.id, name: tag.name })),
      alternateAuthor: snippet.author || '',
      packages: snippet.packages || [],
      copyRecommendation: snippet.copyRecommendation || '',
      versions:
        snippet.versions && snippet.versions.length > 0
          ? snippet.versions.map((v: any) => v.version)
          : [AVAILABLE_TYPST_VERSIONS[0]],
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

        const changes: Record<string, any> = {}

        if (value.title !== snippet.title) {
          changes.title = value.title
        }
        if (value.description !== (snippet.description || '')) {
          changes.description = value.description
        }
        if (codeToSubmit !== (snippet.content || '')) {
          changes.content = codeToSubmit
          changes.versions = value.versions
        }
        const currentTagIds = snippet.tags.map((tag: Tag) => tag.id).sort()
        const newTagIds = value.tags.map((tag: { id: string }) => tag.id).sort()
        if (JSON.stringify(currentTagIds) !== JSON.stringify(newTagIds)) {
          changes.tags = value.tags.map((tag: { id: string }) => tag.id)
        }
        if (
          JSON.stringify(value.packages) !==
          JSON.stringify(snippet.packages || [])
        ) {
          changes.packages = value.packages
        }
        if (value.copyRecommendation !== (snippet.copyRecommendation || '')) {
          changes.copyRecommendation = value.copyRecommendation
        }
        if (value.alternateAuthor !== (snippet.author || '')) {
          changes.author = value.alternateAuthor || undefined
        }
        const currentVersions =
          snippet.versions && snippet.versions.length > 0
            ? snippet.versions.map((v: any) => v.version).sort()
            : [AVAILABLE_TYPST_VERSIONS[0]]
        const newVersions = [...value.versions].sort()
        if (JSON.stringify(currentVersions) !== JSON.stringify(newVersions)) {
          changes.versions = value.versions
        }

        if (Object.keys(changes).length === 0) {
          navigate({ to: '/snippets/$id', params: { id: params.id } })
          return
        }

        await updateSnippet(params.id, changes)
        sessionStorage.removeItem(FORM_STATE_KEY)
        await queryClient.invalidateQueries({
          queryKey: ['snippet', params.id],
        })
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
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STATE_KEY)
      const shouldRestore = sessionStorage.getItem(
        `${FORM_STATE_KEY}_shouldRestore`,
      )

      if (saved && shouldRestore === 'true') {
        const savedState = JSON.parse(saved)
        form.setFieldValue('title', savedState.title)
        form.setFieldValue('description', savedState.description)
        form.setFieldValue('code', savedState.code)
        form.setFieldValue('tags', savedState.tags)
        form.setFieldValue('alternateAuthor', savedState.alternateAuthor)
        form.setFieldValue('packages', savedState.packages)
        form.setFieldValue('copyRecommendation', savedState.copyRecommendation)
        form.setFieldValue('versions', savedState.versions)
      }

      sessionStorage.removeItem(FORM_STATE_KEY)
      sessionStorage.removeItem(`${FORM_STATE_KEY}_shouldRestore`)
    } catch (e) {
      console.error('Failed to restore saved form state:', e)
    }
    setIsInitialized(true)
  }, [FORM_STATE_KEY])

  useEffect(() => {
    if (!isInitialized) return

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
  }, [form.store, FORM_STATE_KEY, isInitialized])

  useEffect(() => {
    return () => {
      if (!router.state.location.pathname.startsWith('/tags/new')) {
        sessionStorage.removeItem(FORM_STATE_KEY)
      }
    }
  }, [router.state.location.pathname, FORM_STATE_KEY])

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
          onCreateTag={() => {
            sessionStorage.setItem(`${FORM_STATE_KEY}_shouldRestore`, 'true')
            navigate({
              to: '/tags/new',
              search: {
                prefillTagName: tagSearch,
                returnTo: `/snippets/${params.id}/edit`,
              },
            })
          }}
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
          onCancel={() =>
            navigate({ to: '/snippets/$id', params: { id: params.id } })
          }
          isEdit={true}
        />
      </form>
    </div>
  )
}
