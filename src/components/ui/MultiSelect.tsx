import { useState } from 'react'
import { X, Plus } from 'lucide-react'

export interface MultiSelectItem {
  id: string
  name: string
  count?: number
  description?: string
}

export interface MultiSelectProps<T extends MultiSelectItem> {
  items: T[]
  selectedItems: T[]
  onSelectionChange: (selectedItems: T[]) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  isLoading?: boolean
  onSearch?: (query: string) => void
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  showDropdown?: boolean
  onCreateNew?: () => void
  createNewLabel?: string
}

export default function MultiSelect<T extends MultiSelectItem>({
  items,
  selectedItems,
  onSelectionChange,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
  label,
  isLoading = false,
  onSearch,
  renderItem,
  showDropdown = false,
  onCreateNew,
  createNewLabel = 'Create new',
}: MultiSelectProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleItem = (item: T) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id)
    if (isSelected) {
      onSelectionChange(
        selectedItems.filter((selected) => selected.id !== item.id),
      )
    } else {
      onSelectionChange([...selectedItems, item])
    }
  }

  const removeItem = (itemId: string) => {
    onSelectionChange(selectedItems.filter((item) => item.id !== itemId))
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const defaultRenderItem = (item: T, isSelected: boolean) => (
    <button
      key={item.id}
      onClick={() => toggleItem(item)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isSelected
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
      }`}
    >
      <span>{item.name}</span>
      {item.count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            isSelected ? 'bg-blue-700' : 'bg-blue-200'
          }`}
        >
          {item.count}
        </span>
      )}
    </button>
  )

  const dropdownRenderItem = (item: T, isSelected: boolean) => (
    <>
      <button
        key={item.id}
        type="button"
        onClick={() => {
          if (!isSelected) {
            toggleItem(item)
          }
          setSearchQuery('')
          setIsDropdownOpen(false)
        }}
        disabled={isSelected}
        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
          isSelected
            ? 'cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        <div className="font-medium">{item.name}</div>
        {item.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {item.description}
          </div>
        )}
      </button>
      <hr className="border-t border-gray-200 dark:border-gray-600" />
    </>
  )

  if (showDropdown) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {selectedItems.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => {
              setTimeout(() => setIsDropdownOpen(false), 200)
            }}
            className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder={searchPlaceholder}
          />
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <div>
                  {onCreateNew && (
                    <button
                      type="button"
                      onClick={() => {
                        onCreateNew()
                        setIsDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {createNewLabel}
                    </button>
                  )}
                  {!onCreateNew && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {placeholder}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSelected = selectedItems.some(
                      (selected) => selected.id === item.id,
                    )
                    return dropdownRenderItem(item, isSelected)
                  })}
                  {onCreateNew && (
                    <button
                      type="button"
                      onClick={() => {
                        onCreateNew()
                        setIsDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 border-b border-gray-200 dark:border-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                      {createNewLabel}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {label && <h2 className="text-xl font-semibold mb-4">{label}</h2>}

      {selectedItems.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white"
              >
                <span>{item.name}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {onSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const isSelected = selectedItems.some(
              (selected) => selected.id === item.id,
            )
            return renderItem
              ? renderItem(item, isSelected)
              : defaultRenderItem(item, isSelected)
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">{placeholder}</div>
      )}
    </div>
  )
}
