interface PaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
      >
        Previous
      </button>
      <span className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {lastPage}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
      >
        Next
      </button>
    </div>
  )
}
