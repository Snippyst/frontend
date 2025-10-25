export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/v1',
} as const

export function getApiUrl(path: string): string {
  const base = API_CONFIG.baseURL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
