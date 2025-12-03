import { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { SearchToken } from '../../types/search'
import type { Tag } from '../../types/tags'
import type { User } from '../../types/auth'
import type { Package } from '../../lib/api/packages'
import { getTags } from '../../lib/api/tags'
import { getUsers } from '../../lib/api/users'
import { getPackages } from '../../lib/api/packages'
import { getSearchSuggestions } from '../../lib/api/snippets'
import { buildSnippetsParams } from '../../lib/search-utils'
import { useDebounce } from '../../hooks/useDebounce'

const AVAILABLE_VERSIONS = ['0.12.0', '0.13.0', '0.13.1', '0.14.0', '0.14.1']

interface SearchInputProps {
  tokens: SearchToken[]
  onTokenAdd: (token: SearchToken) => void
  onTokenRemove: (index: number) => void
  inputValue: string
  onInputChange: (value: string) => void
  onTextSearch?: (text: string) => void
  placeholder?: string
  currentTextSearch?: string
}

export default function SearchInput({
  tokens,
  onTokenAdd,
  onTokenRemove,
  inputValue,
  onInputChange,
  onTextSearch,
  currentTextSearch,
  placeholder = 'Search snippets... (try: tag:, user:, package:, version:)',
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchPrefix, setSearchPrefix] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedInputValue = useDebounce(inputValue, 300)

  const { data: tagsData, isFetching: isFetchingTags } = useQuery({
    queryKey: ['tags', debouncedSearchQuery],
    queryFn: () =>
      getTags({ page: 1, perPage: 10, search: debouncedSearchQuery }),
    enabled: searchPrefix === 'tag',
    placeholderData: (prev) => prev,
  })

  const { data: usersData, isFetching: isFetchingUsers } = useQuery({
    queryKey: ['users', debouncedSearchQuery],
    queryFn: () => getUsers({ search: debouncedSearchQuery }),
    enabled: searchPrefix === 'user' && debouncedSearchQuery.length >= 1,
    placeholderData: (prev) => prev,
  })

  const { data: packagesData, isFetching: isFetchingPackages } = useQuery({
    queryKey: ['packages', debouncedSearchQuery],
    queryFn: () => {
      const parts = debouncedSearchQuery.split('/')
      if (parts.length === 2) {
        return getPackages({
          page: 1,
          perPage: 10,
          namespace: parts[0],
          name: parts[1],
        })
      } else if (parts.length === 1 && debouncedSearchQuery) {
        return getPackages({
          page: 1,
          perPage: 10,
          namespace: debouncedSearchQuery,
        })
      }
      return getPackages({ page: 1, perPage: 10 })
    },
    enabled: searchPrefix === 'package',
    placeholderData: (prev) => prev,
  })

  const snippetsParams = buildSnippetsParams(tokens, currentTextSearch || '')

  const { data: suggestionsData, isFetching: isFetchingSuggestions } = useQuery(
    {
      queryKey: [
        'snippets',
        'suggestions',
        snippetsParams,
        debouncedInputValue,
      ],
      queryFn: () =>
        getSearchSuggestions({
          ...snippetsParams,
          search: debouncedInputValue.trim(),
        }),
      enabled: !searchPrefix && debouncedInputValue.trim().length >= 1,
      placeholderData: (prev) => prev,
    },
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    const prefixMatch = value.match(/^(tag|user|package|version):(.*)/)
    if (prefixMatch) {
      setSearchPrefix(prefixMatch[1])
      setSearchQuery(prefixMatch[2].trim())
      onInputChange('')
      setShowSuggestions(true)
    } else {
      setSearchPrefix(null)
      setSearchQuery('')
      onInputChange(value)
      if (value.trim().length >= 1) {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }
  }

  const handleTagSelect = (tag: Tag) => {
    onTokenAdd({
      type: 'tag',
      value: tag.id,
      displayValue: tag.name,
      id: tag.id,
      metadata: { tag },
    })
    setSearchPrefix(null)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleUserSelect = (user: User) => {
    onTokenAdd({
      type: 'user',
      value: user.id,
      displayValue: user.username,
      id: user.id,
      metadata: { user },
    })
    setSearchPrefix(null)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handlePackageSelect = (pkg: Package) => {
    onTokenAdd({
      type: 'package',
      value: `${pkg.namespace}/${pkg.name}`,
      displayValue: `${pkg.namespace}/${pkg.name}`,
      metadata: { namespace: pkg.namespace, name: pkg.name },
    })
    setSearchPrefix(null)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleVersionSelect = (version: string) => {
    onTokenAdd({
      type: 'version',
      value: version,
      displayValue: version,
    })
    setSearchPrefix(null)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (searchPrefix && searchQuery === '') {
        setSearchPrefix(null)
        setSearchQuery('')
      } else if (inputValue === '' && tokens.length > 0) {
        onTokenRemove(tokens.length - 1)
      }
    } else if (e.key === 'Escape') {
      if (searchPrefix) {
        setSearchPrefix(null)
        setSearchQuery('')
      }
      setShowSuggestions(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim() && !searchPrefix && onTextSearch) {
        onTextSearch(inputValue.trim())
      }
    }
  }

  const getSuggestions = () => {
    if (!showSuggestions) return null

    const isLoading =
      isFetchingTags ||
      isFetchingUsers ||
      isFetchingPackages ||
      isFetchingSuggestions

    if (searchPrefix === 'tag') {
      const tags = tagsData?.data || []
      return (
        <>
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tags...
            </div>
          )}
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagSelect(tag)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <div className="font-medium">{tag.name}</div>
              {tag.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {tag.description}
                </div>
              )}
            </button>
          ))}
        </>
      )
    }

    if (searchPrefix === 'user') {
      const users = usersData || []
      return (
        <>
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading users...
            </div>
          )}
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <div className="font-medium">{user.username}</div>
              {user.email && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              )}
            </button>
          ))}
        </>
      )
    }

    if (searchPrefix === 'package') {
      const packages = packagesData?.data || []
      return (
        <>
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading packages...
            </div>
          )}
          {packages.map((pkg, index) => (
            <button
              key={`${pkg.namespace}-${pkg.name}-${index}`}
              onClick={() => handlePackageSelect(pkg)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <div className="font-medium">
                {pkg.namespace}/{pkg.name}
              </div>
            </button>
          ))}
        </>
      )
    }

    if (searchPrefix === 'version') {
      const filteredVersions = AVAILABLE_VERSIONS.filter((v) =>
        v.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      return filteredVersions.map((version) => (
        <button
          key={version}
          onClick={() => handleVersionSelect(version)}
          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        >
          <div className="font-medium">{version}</div>
        </button>
      ))
    }

    if (!searchPrefix && inputValue.trim().length >= 1) {
      const suggestions = suggestionsData?.suggestions || []
      const prefixes = [
        { key: 'tag:', label: 'tag', color: 'blue' },
        { key: 'user:', label: 'user', color: 'green' },
        { key: 'package:', label: 'package', color: 'purple' },
        { key: 'version:', label: 'version', color: 'orange' },
      ]
      const prefixSuggestions = prefixes.filter((prefix) =>
        prefix.key.startsWith(inputValue.toLowerCase()),
      )

      const getColorClasses = (color: string) => {
        switch (color) {
          case 'blue':
            return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
          case 'green':
            return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
          case 'purple':
            return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
          case 'orange':
            return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
          default:
            return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
        }
      }

      return (
        <>
          {prefixSuggestions.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                Filter by type:
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                {prefixSuggestions.map((prefix) => (
                  <button
                    key={prefix.key}
                    onClick={() => {
                      onInputChange(prefix.key)
                      setShowSuggestions(true)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors hover:opacity-80 ${getColorClasses(prefix.color)}`}
                  >
                    <span className="font-semibold">{prefix.key}</span>
                    <span className="text-xs opacity-70">
                      Search {prefix.label}
                    </span>
                  </button>
                ))}
              </div>
              {(suggestions.length > 0 || isLoading) && (
                <div className="border-t border-gray-200 dark:border-gray-600" />
              )}
            </>
          )}
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading suggestions...
            </div>
          )}
          {suggestions.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                Suggestions:
              </div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onTextSearch) {
                      onTextSearch(suggestion)
                      setShowSuggestions(false)
                    }
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <div className="font-medium">{suggestion}</div>
                </button>
              ))}
            </>
          )}
        </>
      )
    }

    return null
  }

  const suggestions = getSuggestions()
  const hasSuggestions = Array.isArray(suggestions)
    ? suggestions.length > 0
    : suggestions !== null

  const getTokenColor = (type: string) => {
    switch (type) {
      case 'tag':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'package':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'version':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getTokenPrefix = (type: string) => {
    switch (type) {
      case 'tag':
        return 'tag:'
      case 'user':
        return 'user:'
      case 'package':
        return 'package:'
      case 'version':
        return 'version:'
      default:
        return ''
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 min-h-[42px]">
        {tokens.map((token, index) => (
          <span
            key={`${token.type}-${token.value}-${index}`}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${getTokenColor(token.type)}`}
          >
            <span className="font-semibold">{getTokenPrefix(token.type)}</span>
            {token.displayValue}
            <button
              onClick={() => onTokenRemove(index)}
              className="ml-1 hover:opacity-70"
              aria-label={`Remove ${token.type} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 min-w-[200px] relative">
          {searchPrefix && (
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium pointer-events-none ${getTokenColor(searchPrefix)}`}
            >
              <span className="font-semibold">
                {getTokenPrefix(searchPrefix)}
              </span>
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={searchPrefix ? searchQuery : inputValue}
            onChange={(e) => {
              if (searchPrefix) {
                setSearchQuery(e.target.value)
              } else {
                handleInputChange(e.target.value)
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchPrefix || inputValue.trim().length >= 1) {
                setShowSuggestions(true)
              }
            }}
            placeholder={
              tokens.length === 0 && !searchPrefix && !currentTextSearch
                ? placeholder
                : ''
            }
            style={
              searchPrefix
                ? {
                    paddingLeft: `${getTokenPrefix(searchPrefix).length * 8 + 24}px`,
                  }
                : {}
            }
            className="w-full outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {showSuggestions && hasSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions}
        </div>
      )}
    </div>
  )
}
