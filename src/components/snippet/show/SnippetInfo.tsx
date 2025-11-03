import VoteButton from '../VoteButton'
import type { Snippet } from '@/types/snippet'
import { Link } from '@tanstack/react-router'

interface SnippetInfoProps {
  snippet: Snippet
}

export default function SnippetInfo({ snippet }: SnippetInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {snippet.title}
      </h1>
      {/* TODO Better parsing */}
      {snippet.description && (
        <p
          className="text-gray-700 dark:text-gray-300 mb-4 max-h-48 overflow-auto"
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {snippet.description}
        </p>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Created by:
          </span>{' '}
          {snippet.author ? (
            <span className="text-gray-900 dark:text-gray-100">
              {snippet.author}
            </span>
          ) : (
            <Link
              to="/snippets"
              search={{ userId: snippet.createdBy.id }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {snippet.createdBy.username}
            </Link>
          )}
          <div />
          {snippet.author && (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Uploaded by:
              </span>{' '}
              <Link
                to="/snippets"
                search={{ userId: snippet.createdBy.id }}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {snippet.createdBy.username}
              </Link>
            </>
          )}
          {/* For now we use lastUpdatedAt. Later use updatedAt. Thus not added to the types */}
          {/* @ts-ignore */}
          {snippet.lastUpdatedAt && (
            <>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Last updated:
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {/* @ts-ignore */}
                  {new Date(snippet.lastUpdatedAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>

        {snippet.updatedAt && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Updated:
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {new Date(snippet.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {snippet.versions && snippet.versions.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Versions:
              </span>
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs cursor-help"
                title="These versions indicate successful compilation at the time of testing. Versions do not mean the snippet is incompatible with other versions. Currently only the newest version can be compiled."
              >
                ?
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {snippet.versions.map((v, idx) => (
                <Link
                  key={idx}
                  to="/snippets"
                  search={{ versions: [v.version] }}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono transition-opacity hover:opacity-80 ${
                    v.success
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                  }`}
                >
                  {v.version}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {snippet.tags && snippet.tags.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Tags:
          </span>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <Link
                key={tag.id}
                to="/snippets"
                search={{ tags: [tag.id] }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <VoteButton
          snippet={snippet}
          initialUpvotes={snippet.numberOfUpvotes ?? 0}
          initialIsUpvoted={snippet.isUpvoted ?? false}
        />
      </div>

      {snippet.packages && snippet.packages.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Packages:
          </span>
          <div className="space-y-1">
            {snippet.packages.map((pkg, idx) => (
              <Link
                key={idx}
                to="/snippets"
                search={{
                  packages: JSON.stringify([
                    {
                      namespace: pkg.namespace,
                      name: pkg.name,
                      version: pkg.version,
                    },
                  ]),
                }}
                className="block text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
              >
                {pkg.namespace}/{pkg.name}@{pkg.version}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
