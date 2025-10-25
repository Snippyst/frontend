import { Trash2 } from 'lucide-react'
import { deleteSnippet } from '@/lib/api/snippets'

interface DeleteButtonProps {
  snippetId: string
}

export default function DeleteButton({ snippetId }: DeleteButtonProps) {
  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this snippet? This action cannot be undone.',
      )
    ) {
      deleteSnippet(snippetId).then(() => {
        window.location.href = '/snippets'
      })
    }
  }

  return (
    <button
      className="flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm cursor-pointer"
      onClick={handleDelete}
    >
      <Trash2 size={20} />
    </button>
  )
}
