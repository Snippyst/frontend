import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-b-current border-text-primary',
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Spinner.displayName = 'Spinner'
