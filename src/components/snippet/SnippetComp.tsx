import { Snippet } from '@/types/snippet'
import { Link } from '@tanstack/react-router'
import VoteButton from './VoteButton'
import DownloadButton from './DownloadButton'

export default function SnippetComp({ snippet }: { snippet: Snippet }) {
  return (
    <>
      <div>
        <Link
          to="/snippets/$id"
          params={{ id: snippet.id }}
          key={snippet.id}
          className="block border rounded-lg p-4 transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl"
        >
          <div className="mb-4 h-48 w-full overflow-hidden rounded-md bg-white border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <img
              src={snippet.image + '/preview'}
              alt={snippet.title}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white flex justify-between items-center">
            <div>{snippet.title}</div>
            <div className="flex items-center gap-2">
              <VoteButton
                snippet={snippet}
                initialUpvotes={snippet.numberOfUpvotes ?? 0}
                initialIsUpvoted={snippet.isUpvoted ?? false}
              />
              <DownloadButton snippet={snippet} type="svg" format="small" />
            </div>
          </h2>
          {snippet.description && (
            <p className="mb-3 text-gray-700 dark:text-gray-400">
              {snippet.description}
            </p>
          )}
          <div className="mb-3 flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            {snippet.author != null ? (
              <>
                By {snippet.author} <br />
                {snippet.createdBy?.username && (
                  <>
                    {' '}
                    (Uploaded by{' '}
                    <Link
                      to="/snippets"
                      search={{ userId: snippet.createdBy.id }}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {snippet.createdBy.username}
                    </Link>
                    )
                  </>
                )}
              </>
            ) : (
              <>
                Created by{' '}
                <Link
                  to="/snippets"
                  search={{ userId: snippet.createdBy?.id }}
                  className="hover:underline"
                  onClick={(e) => {
                    // TODO needs to be better handeled
                    e.stopPropagation()
                    e.preventDefault()
                    const id = snippet.createdBy?.id
                    const query = id
                      ? `?userId=${encodeURIComponent(String(id))}`
                      : ''
                    window.location.href = `/snippets${query}`
                  }}
                >
                  {snippet.createdBy?.username}
                </Link>
              </>
            )}
          </p>
        </Link>
      </div>
    </>
  )
}
