import { AlertCircle } from 'lucide-react'

interface SubmitSectionProps {
  form: any
  submitError: string | null
  onCancel: () => void
}

export function SubmitSection({
  form,
  submitError,
  onCancel,
}: SubmitSectionProps) {
  return (
    <>
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

      <div className="space-y-4 pt-2">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            By creating a snippet, you confirm that you have the necessary
            rights to upload and distribute this content. Published snippets may
            be used by others in compiled or binary form for personal and
            commercial purposes.
          </p>
          <p>
            You may specify a license in the description. However, any license
            must not restrict the users rights to modify, distribute, or use the
            compiled output for personal or commercial purposes.
          </p>
        </div>

        <form.Subscribe
          selector={(state: any) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="rounded-md border border-transparent bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
              >
                {isSubmitting ? 'Uploading and compiling...' : 'Create Snippet'}
              </button>
            </div>
          )}
        />
      </div>
    </>
  )
}
