interface LoadingListProps {
  count?: number
  height?: string
}

export function LoadingList({ count = 5, height = 'h-24' }: LoadingListProps) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 animate-pulse ${height}`}
        />
      ))}
    </div>
  )
}
