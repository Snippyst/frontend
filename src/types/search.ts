import type { User } from './auth'
import type { Tag } from './tags'

export type SearchTokenType = 'tag' | 'user' | 'package' | 'version' | 'text'

export interface SearchToken {
  type: SearchTokenType
  value: string
  displayValue: string
  id?: string
  metadata?: {
    namespace?: string
    name?: string
    user?: User
    tag?: Tag
  }
}

export interface ParsedSearch {
  tokens: SearchToken[]
  textQuery: string
}
