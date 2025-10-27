import { getApiUrl } from '../api-config'
import type { User } from '../../types/auth'

export interface GetUsersParams {
  search?: string
}

export async function getUsers(params: GetUsersParams = {}): Promise<User[]> {
  const { search } = params

  const url = new URL(getApiUrl('/users'))
  if (search) {
    url.searchParams.set('username', search)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}
