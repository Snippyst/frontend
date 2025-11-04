import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Tag, FileCode, Users, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/moderation/PageHeader'

export const Route = createFileRoute('/moderation/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()

  if (!user?.isPrivileged) {
    return <Navigate to="/" />
  }

  const abilities = user.abilities || []
  const hasTags =
    abilities.includes('tags:update') || abilities.includes('tags:delete')
  const hasSnippets = abilities.includes('snippets:manage')
  const hasUsers = abilities.includes('users:manage')
  const hasComments =
    abilities.includes('comments:manage') && abilities.includes('users:manage')

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title="Moderation Dashboard"
        description="Manage tags, snippets, and users"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {hasTags && (
          <Link
            to="/moderation/tags"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <Tag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Tags
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {abilities.includes('tags:update') && 'Edit'}
                  {abilities.includes('tags:update') &&
                    abilities.includes('tags:delete') &&
                    ' and '}
                  {abilities.includes('tags:delete') && 'delete'} tags
                </p>
              </div>
            </div>
          </Link>
        )}

        {hasSnippets && (
          <Link
            to="/moderation/snippets"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <FileCode className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Snippets
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage snippets
                </p>
              </div>
            </div>
          </Link>
        )}

        {hasUsers && (
          <Link
            to="/moderation/users"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Users
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage users
                </p>
              </div>
            </div>
          </Link>
        )}

        {hasComments && (
          <Link
            to="/moderation/comments"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <MessageSquare className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  User Comments
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage user comments
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {!hasTags && !hasSnippets && !hasUsers && !hasComments && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have any moderation permissions.
          </p>
        </div>
      )}
    </div>
  )
}
