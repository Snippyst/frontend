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
          className="block border rounded-lg p-4 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:shadow-xl"
        >
          <div className="mb-4 h-48 w-full overflow-hidden rounded-md bg-white  flex items-center justify-center">
            <img
              src={snippet.image + '/preview'}
              alt={snippet.title}
              className="max-w-full max-h-full object-contain "
              loading="lazy"
            />
          </div>

          <h2 className="mb-2 text-xl font-semibold dark:text-white flex justify-between items-center">
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
            <p className="mb-3 text-gray-600 dark:text-gray-400">
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
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {snippet.author != null ? (
              <>
                By {snippet.author} <br />
                {snippet.createdBy?.username && (
                  <> (Uploaded by {snippet.createdBy.username})</>
                )}
              </>
            ) : (
              <>Created by {snippet.createdBy?.username}</>
            )}
          </p>
        </Link>
      </div>
    </>
  )
}
