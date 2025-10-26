import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { createTag } from '../../lib/api/tags'
import { tagFormSchema } from '../../lib/validation/tagSchema'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/tags/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await createTag({
          name: value.name,
          description: value.description || undefined,
        })
        navigate({ to: '/snippets/new' })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create tag. Please try again.'
        setSubmitError(errorMessage)
      }
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create New Tag
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Add a new tag to categorize snippets
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
            Tag Information
          </h2>
          <div className="grid gap-4">
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  const result = tagFormSchema.shape.name.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Tag Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    placeholder="e.g., mathematics, diagrams, tables"
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isBlurred && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onBlur: ({ value }) => {
                  const result =
                    tagFormSchema.shape.description.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Description
                    <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={2}
                    className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    placeholder="Optional description of what this tag is used for"
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isBlurred && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Error creating tag
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}

        <form.Subscribe
          selector={(state: any) => [state.canSubmit, state.isSubmitting]}
        >
          {(state: any) => (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/snippets/new' })}
                disabled={state[1]}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!state[0] || state[1]}
                className="rounded-md border border-transparent bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
              >
                {state[1] ? 'Creating...' : 'Create Tag'}
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
