import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voteSnippet } from '@/lib/api/snippets'
import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface VoteButtonProps {
  snippetId: string
  initialUpvotes: number
  initialIsUpvoted: boolean
}

export default function VoteButton({
  snippetId,
  initialUpvotes,
  initialIsUpvoted,
}: VoteButtonProps) {
  const queryClient = useQueryClient()
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted)
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const { isAuthenticated } = useAuth()

  const voteMutation = useMutation({
    mutationFn: async (vote: boolean) => {
      await voteSnippet(snippetId, vote)
    },
    onMutate: async (vote: boolean) => {
      const previousIsUpvoted = isUpvoted
      const previousUpvotes = upvotes

      if (vote) {
        setIsUpvoted(true)
        setUpvotes(previousIsUpvoted ? upvotes : upvotes + 1)
      } else {
        setIsUpvoted(false)
        setUpvotes(previousIsUpvoted ? upvotes - 1 : upvotes)
      }

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
      queryClient.invalidateQueries({ queryKey: ['snippet', snippetId] })
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isUpvoted) {
      voteMutation.mutate(false)
    } else {
      voteMutation.mutate(true)
    }
  }

  console.log(isUpvoted)

  return (
    <button
      onClick={handleVote}
      disabled={voteMutation.isPending || !isAuthenticated}
      className={`
  flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium
  transition-all
  ${voteMutation.isPending ? 'cursor-not-allowed opacity-50' : ' hover:bg-gray-200 dark:hover:bg-gray-700'}
  ${
    !isAuthenticated
      ? 'opacity-60 cursor-not-allowed grayscale'
      : 'cursor-pointer'
  }
  ${isUpvoted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800/75 dark:text-gray-200'}
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
