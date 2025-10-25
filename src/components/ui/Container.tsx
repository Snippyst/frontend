import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'full' | 'md'
  centered?: boolean
}

const maxWidthStyles = {
  full: 'max-w-7xl',
  md: 'max-w-screen-md',
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    { maxWidth = 'full', centered = true, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-4',
          maxWidthStyles[maxWidth],
          centered && 'mx-auto',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Container.displayName = 'Container'
