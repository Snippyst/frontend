import { snippetFormSchema } from '../../../lib/validation/snippetSchema'
import { MultiSelect } from '../../ui'
import type { Tag } from '../../../types/tags'

interface BasicInformationProps {
  form: any
  availableTags: Tag[]
  loadingTags: boolean
  onTagSearch: (search: string) => void
  onCreateTag?: () => void
}

export function BasicInformation({
  form,
  availableTags,
  loadingTags,
  onTagSearch,
  onCreateTag,
}: BasicInformationProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Basic Information
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="title"
          validators={{
            onBlur: ({ value }: any) => {
              const result = snippetFormSchema.shape.title.safeParse(value)
              return result.success
                ? undefined
                : result.error.issues[0]?.message
            },
          }}
        >
          {(field: any) => (
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
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isBlurred && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {field.state.meta.errors[0]}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="tags">
          {(field: any) => (
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
                onSearch={onTagSearch}
                showDropdown={true}
                onCreateNew={onCreateTag}
                createNewLabel="Create new tag"
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="description"
          validators={{
            onBlur: ({ value }: any) => {
              const result =
                snippetFormSchema.shape.description.safeParse(value)
              return result.success
                ? undefined
                : result.error.issues[0]?.message
            },
          }}
        >
          {(field: any) => (
            <div className="md:col-span-2">
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
          name="alternateAuthor"
          validators={{
            onBlur: ({ value }: any) => {
              const result =
                snippetFormSchema.shape.alternateAuthor.safeParse(value)
              return result.success
                ? undefined
                : result.error.issues[0]?.message
            },
          }}
        >
          {(field: any) => (
            <div className="md:col-span-2">
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
  )
}
