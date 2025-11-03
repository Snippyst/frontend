import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voteSnippet } from '@/lib/api/snippets'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Snippet } from '@/types/snippet'
import { useNavigate } from 'node_modules/@tanstack/react-router/dist/esm/useNavigate'

interface VoteButtonProps {
  snippet: Snippet
  initialUpvotes: number
  initialIsUpvoted: boolean
}

export default function VoteButton({
  snippet,
  initialUpvotes,
  initialIsUpvoted,
}: VoteButtonProps) {
  const queryClient = useQueryClient()
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted)
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsUpvoted(snippet.isUpvoted ?? false)
  }, [snippet.isUpvoted])

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      await navigate({ to: '/auth/login' })
      return
    }

    voteMutation.mutate(!isUpvoted)
  }

  const voteMutation = useMutation({
    mutationFn: async (vote: boolean) => {
      await voteSnippet(snippet.id, vote)
    },
    onMutate: async (vote: boolean) => {
      const previousIsUpvoted = isUpvoted
      const previousUpvotes = upvotes

      setIsUpvoted(vote)
      setUpvotes(
        vote
          ? previousIsUpvoted
            ? upvotes
            : upvotes + 1
          : previousIsUpvoted
            ? upvotes - 1
            : upvotes,
      )

      return { previousIsUpvoted, previousUpvotes }
    },
    onError: (err, _vote, context) => {
      if (context) {
        setIsUpvoted(context.previousIsUpvoted)
        setUpvotes(context.previousUpvotes)
      }
      console.error('Failed to vote:', err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippet', snippet.id] })
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })

  return (
    <button
      onClick={handleVote}
      className={`
        flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium
        ${voteMutation.isPending ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
        ${!isAuthenticated ? 'opacity-60 ' : 'cursor-pointer'}
        ${isUpvoted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200'}
      `}
      title={
        isAuthenticated
          ? isUpvoted
            ? 'Remove upvote'
            : 'Upvote'
          : 'Log in to upvote'
      }
    >
      <ArrowUp className="h-4 w-4" />
      <span>{upvotes}</span>
    </button>
  )
}
