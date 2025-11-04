import { useState, useEffect, useRef } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getComments, createComment, deleteComment } from '@/lib/api/comments'
import type { Comment } from '@/types/comments'

interface CommentsProps {
  snippetId: string
}

function CommentSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function Comments({ snippetId }: CommentsProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const abilities = user?.abilities || []
  const canCreate = abilities.includes('comments:create')
  const canDelete = abilities.includes('comments:delete')
  const canManage = abilities.includes('comments:manage')

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['comments', snippetId],
      queryFn: ({ pageParam = 1 }) =>
        getComments({ snippetId, page: pageParam, perPage: 25 }),
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
          return lastPage.meta.currentPage + 1
        }
        return undefined
      },
      enabled: !!snippetId,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      initialPageParam: 1,
    })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      if (user) {
        const newComment: Comment = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isPrivileged: user.isPrivileged,
            abilities: user.abilities,
          },
          createdAt: new Date().toISOString(),
        }

        queryClient.setQueryData(['comments', snippetId], (old: any) => {
          if (!old?.pages?.[0]) return old
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                data: [newComment, ...old.pages[0].data],
              },
              ...old.pages.slice(1),
            ],
          }
        })
      }

      setContent('')

      queryClient.invalidateQueries({ queryKey: ['comments', snippetId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', snippetId] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.length > 1024) return

    setIsSubmitting(true)
    try {
      await createMutation.mutateAsync({
        content: content.trim(),
        snippetId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string, commentUserId: string) => {
    const isOwnComment = commentUserId === user?.id
    const hasPermission = (isOwnComment && canDelete) || canManage

    if (!hasPermission) return

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    await deleteMutation.mutateAsync(commentId)
  }

  const allComments = data?.pages.flatMap((page) => page.data) || []

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Comments
      </h2>

      {canCreate && user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none placeholder-gray-400 dark:placeholder-gray-500"
              rows={3}
              minLength={1}
              maxLength={1024}
              disabled={isSubmitting}
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {content.length}/1024 characters
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || content.length > 1024}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {!user && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to post comments.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {!isLoading && allComments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}

      <div className="space-y-4">
        {allComments.map((comment: Comment) => {
          const isOwnComment = comment.user.id === user?.id
          const canDeleteThis = (isOwnComment && canDelete) || canManage

          return (
            <div
              key={comment.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.username}
                    </span>
                    {comment.createdAt && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                {canDeleteThis && (
                  <button
                    onClick={() => handleDelete(comment.id, comment.user.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isFetchingNextPage && (
        <div className="space-y-4 mt-4">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      <div ref={observerTarget} className="h-4" />
    </div>
  )
}
