import type { PaginationMeta } from './common'

export interface ModerationUser {
  id: string
  username: string
  disabled?: boolean
  createdAt?: string
  deletedAt?: string | null
  abilities?: string[]
}

export interface ModerationUsersResponse {
  data: ModerationUser[]
  meta: PaginationMeta
}

export interface UserActionRequest {
  id: string
}
