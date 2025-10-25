import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from '@tanstack/react-router'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface LinkProps extends Omit<RouterLinkProps, 'className'> {
  variant?: 'default' | 'primary' | 'muted'
  className?: string
}

const variantStyles = {
  default:
    'text-text-primary hover:text-text-secondary underline-offset-4 hover:underline',
  primary:
    'text-primary-400 hover:text-primary-300 underline-offset-4 hover:underline',
  muted:
    'text-text-muted hover:text-text-secondary underline-offset-4 hover:underline',
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <RouterLink
        ref={ref}
        className={cn('transition-colors', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </RouterLink>
    )
  },
)

Link.displayName = 'Link'
