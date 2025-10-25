export interface User {
  id: string
  username: string
  email?: string
  computationTime?: number
}

export interface Token {
  token: string
  expiresAt: string
  abilities?: string[]
}
