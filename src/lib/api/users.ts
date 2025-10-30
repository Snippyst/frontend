import { getApiUrl } from '../api-config'
import type { User } from '../../types/auth'
import type { ModerationUsersResponse } from '../../types/moderation'

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

export interface GetModerationUsersParams {
  page?: number
  perPage?: number
}

export async function getModerationUsers(
  params: GetModerationUsersParams = {},
): Promise<ModerationUsersResponse> {
  const { page = 1, perPage = 20 } = params

  const url = new URL(getApiUrl('/users/admin-list'))
  url.searchParams.set('page', String(page))
  url.searchParams.set('perPage', String(perPage))

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}

export async function disableUser(id: string): Promise<void> {
  const response = await fetch(getApiUrl('/users/disable'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to disable user: ${response.statusText}`,
    )
  }
}

export async function enableUser(id: string): Promise<void> {
  const response = await fetch(getApiUrl('/users/enable'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to enable user: ${response.statusText}`,
    )
  }
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(getApiUrl('/users/delete'), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to delete user: ${response.statusText}`,
    )
  }
}
