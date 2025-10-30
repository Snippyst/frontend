import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  initialValue?: string
  placeholder?: string
  onSearch: (value: string) => void
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search...',
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  )
}
