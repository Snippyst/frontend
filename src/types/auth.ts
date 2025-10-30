export interface User {
  id: string
  username: string
  email?: string
  computationTime?: number
  isPrivileged?: boolean
  abilities?: string[]
  disabled?: boolean
}

export interface Token {
  token: string
  expiresAt: string
  abilities?: string[]
}
