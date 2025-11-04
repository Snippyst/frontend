import { getApiUrl } from '../api-config'
import type { CommentsResponse, CreateCommentData } from '../../types/comments'

export interface GetCommentsParams {
  snippetId: string
  page?: number
  perPage?: number
}

export async function getComments(
  params: GetCommentsParams,
): Promise<CommentsResponse> {
  const { snippetId, page = 1, perPage = 25 } = params

  const url = new URL(getApiUrl(`/snippets/${snippetId}/comments`))
  url.searchParams.set('page', String(page))
  url.searchParams.set('perPage', String(perPage))

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    const error: any = new Error(`Failed to fetch comments: ${response.statusText}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function createComment(
  data: CreateCommentData,
): Promise<void> {
  const response = await fetch(getApiUrl('/comments/create'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to create comment: ${response.statusText}`,
    )
  }
}

export async function deleteComment(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/comments/${id}/delete`), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `Failed to delete comment: ${response.statusText}`,
    )
  }
}

export interface GetUserCommentsParams {
  userId: string
  page?: number
  perPage?: number
}

export async function getUserComments(
  params: GetUserCommentsParams,
): Promise<CommentsResponse> {
  const { userId, page = 1, perPage = 25 } = params

  const url = new URL(getApiUrl(`/moderation/comments-by-user/${userId}`))
  url.searchParams.set('page', String(page))
  url.searchParams.set('perPage', String(perPage))

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    const error: any = new Error(`Failed to fetch user comments: ${response.statusText}`)
    error.status = response.status
    throw error
  }

  return response.json()
}
