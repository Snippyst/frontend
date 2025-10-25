import { Token, User } from '@/types/auth'
import { getApiUrl } from '../api-config'

export type AuthProvider = 'github' | 'discord'

const AUTH_COOKIE_NAME = 'isAuthenticated'

function setAuthCookie(value: boolean): void {
  if (typeof document === 'undefined') return
  const maxAge = value ? 60 * 60 * 24 * 365 : 0
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getAuthCookie(): boolean {
  if (typeof document === 'undefined') return false
  const cookies = document.cookie.split(';')
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`),
  )
  return authCookie?.split('=')[1] === 'true'
}

export interface AuthCallbackResponse {
  token: Token
  user?: User
}

export async function initOAuthRedirectUrl(
  provider: AuthProvider,
): Promise<void> {
  window.location.href = getApiUrl(`/${provider}/redirect`)
}

export async function handleOAuthCallback(
  provider: AuthProvider,
  code: string,
  state?: string,
): Promise<AuthCallbackResponse> {
  const params = new URLSearchParams({ code })
  if (state) params.set('state', state)

  const response = await fetch(getApiUrl(`/${provider}/callback?${params}`), {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`OAuth callback failed: ${response.statusText}`)
  }

  setAuthCookie(true)
  return response.json()
}

export async function logout(): Promise<void> {
  const response = await fetch(getApiUrl('/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.statusText}`)
  }

  setAuthCookie(false)
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(getApiUrl('/me'), {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      setAuthCookie(false)
    }
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }

  return response.json()
}

export async function deleteAccount(): Promise<{
  message: string
  success: boolean
}> {
  const response = await fetch(getApiUrl('/me/delete'), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete account: ${response.statusText}`)
  }

  const result = await response.json()
  if (result.success) setAuthCookie(false)
  return result
}
