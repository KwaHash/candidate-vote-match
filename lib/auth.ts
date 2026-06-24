import { verify } from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_token_secret'

export type AccessTokenPayload = {
  user_id: number
  user_email: string
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  const tokenData = localStorage.getItem('jwt-token')
  if (!tokenData) return null
  try {
    const { access_token } = JSON.parse(tokenData)
    return access_token ?? null
  } catch {
    return null
  }
}

export function getAccessTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim()
  }
  return null
}

export function getUserFromAccessToken(
  accessToken: string | null | undefined
): AccessTokenPayload | null {
  if (!accessToken) return null
  try {
    const payload = verify(accessToken, ACCESS_SECRET) as {
      user_id: string | number
      user_email: string
    }
    const userId = Number(payload.user_id)
    if (!userId || !payload.user_email) return null
    return { user_id: userId, user_email: payload.user_email }
  } catch {
    return null
  }
}
