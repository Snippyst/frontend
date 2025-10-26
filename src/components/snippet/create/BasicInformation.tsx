import MultiSelect from '../../ui/MultiSelect'
import type { Tag } from '../../../types/tags'

interface BasicInformationProps {
  title: string
  description: string
  tags: Array<{ id: string; name: string }>
  alternateAuthor: string
  availableTags: Tag[]
  loadingTags: boolean
  titleError?: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTagsChange: (tags: Array<{ id: string; name: string }>) => void
  onAlternateAuthorChange: (value: string) => void
  onTagSearch: (search: string) => void
}

export function BasicInformation({
  title,
  description,
  tags,
  alternateAuthor,
  availableTags,
  loadingTags,
  titleError,
  onTitleChange,
  onDescriptionChange,
  onTagsChange,
  onAlternateAuthorChange,
  onTagSearch,
}: BasicInformationProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Basic Information
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder="e.g., Beautiful Mathematical Equations"
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {titleError}
            </p>
          )}
        </div>

        <div>
          <MultiSelect
            items={availableTags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              count: tag.numberOfSnippets,
            }))}
            selectedItems={tags}
            onSelectionChange={(newTags) =>
              onTagsChange(
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
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder="Briefly describe what this snippet does..."
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="alternateAuthor"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Alternate Author
            <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
              (optional)
            </span>
          </label>
          <input
            id="alternateAuthor"
            name="alternateAuthor"
            value={alternateAuthor}
            onChange={(e) => onAlternateAuthorChange(e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder="Credit the original author if applicable"
          />
        </div>
      </div>
    </div>
  )
}
