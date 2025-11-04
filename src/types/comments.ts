import type { User } from './auth'
import type { PaginationMeta } from './common'

export interface Comment {
  id: string
  content: string
  user: User
  createdAt?: string
  updatedAt?: string
}

export interface CreateCommentData {
  content: string
  snippetId: string
}

export interface CommentsResponse {
  data: Comment[]
  meta: PaginationMeta
}
