interface ViewModeToggleProps {
  viewMode: 'split' | 'stacked'
  onChange: (mode: 'split' | 'stacked') => void
}

export default function ViewModeToggle({
  viewMode,
  onChange,
}: ViewModeToggleProps) {
  return (
    <div className="rounded-md border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700">
      <button
        type="button"
        onClick={() => onChange('split')}
        className={`rounded px-2 py-1 text-xs font-medium transition-all ${
          viewMode === 'split'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        Split
      </button>
      <button
        type="button"
        onClick={() => onChange('stacked')}
        className={`rounded px-2 py-1 text-xs font-medium transition-all ${
          viewMode === 'stacked'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        Stacked
      </button>
    </div>
  )
}
