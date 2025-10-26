export default function SkeletonCard() {
  return (
    <div className="block border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 h-48 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />

      <div className="mb-2 flex justify-between items-center">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  )
}
