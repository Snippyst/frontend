import { PaginationMeta } from './common'

export interface Tag {
  id: string
  name: string
  description?: string
  numberOfSnippets?: number
}

export interface TagResponse {
  data: Tag[]
  meta: PaginationMeta
}
