import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentUser,
  logout as logoutApi,
  getAuthCookie,
} from '../lib/api/auth'
import { User } from '@/types/auth'

export const currentUserQueryKey = ['auth', 'currentUser'] as const

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: getAuthCookie(),
  })

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout failed:', error)
    }
    queryClient.setQueryData(currentUserQueryKey, null)
    navigate({ to: '/auth/login' })
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
    refetchUser: () =>
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
  }
}
