/**
 * Type definitions for Snippet API responses
 */

import { User } from './auth'
import { PaginationMeta } from './common'
import { Tag } from './tags'

export interface Package {
  namespace: string
  name: string
  version: string
}

export interface SnippetVersion {
  version: string
  success: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Snippet {
  id: string
  title: string
  description: string | null
  tags: Tag[]
  image: string
  author?: string | null
  createdBy: User
  content?: string
  packages?: Package[]
  copyRecommendation?: string
  createdAt?: string
  updatedAt?: string
  isUpvoted?: boolean
  numberOfUpvotes?: number
  versions?: SnippetVersion[]
}

export interface SnippetsResponse {
  data: Snippet[]
  meta: PaginationMeta
}
