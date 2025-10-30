import type { ReactNode } from 'react'

interface ActionButtonProps {
  onClick: () => void
  icon: ReactNode
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  children: ReactNode
}

const variantStyles = {
  primary:
    'border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary:
    'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  danger:
    'border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
}

export function ActionButton({
  onClick,
  icon,
  loading = false,
  variant = 'secondary',
  children,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900 ${variantStyles[variant]}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
