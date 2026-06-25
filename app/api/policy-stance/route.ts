import { getAccessTokenFromRequest, getUserFromAccessToken } from '@/lib/auth'
import { withDatabase } from '@/lib/db'
import type { PolicyImportance, ProfileQuestionAnswer } from '@/types/type.profile'
import { NextRequest, NextResponse } from 'next/server'

async function ensureVerifiedCandidate(userId: number, userEmail: string) {
  return withDatabase(async (db) => {
    const [rows]: any = await db.query(
      'SELECT id, email, is_verified FROM candidates WHERE id = ?',
      [userId]
    )
    const user = rows[0]
    if (!user || user.id !== userId || user.email !== userEmail || !user.is_verified) {
      return false
    }
    return true
  })
}

function normalizePolicyStance(value: unknown): ProfileQuestionAnswer[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => {
      const note = item.note != null ? String(item.note).trim() : ''
      return {
        question: String(item.question ?? '').trim(),
        answer: String(item.answer ?? '').trim(),
        importance: String(item.importance ?? '').trim() as PolicyImportance | '',
        evidence_url: String(item.evidence_url ?? '').trim(),
        ...(note ? { note } : {}),
      }
    })
    .filter((item) => item.question !== '' && item.answer !== '')
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req)
    const authUser = getUserFromAccessToken(accessToken)
    if (!authUser) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }
    const isVerified = await ensureVerifiedCandidate(authUser.user_id, authUser.user_email)
    if (!isVerified) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const policyStance = await withDatabase(async (db) => {
      const [rows]: any = await db.query(
        'SELECT policy_stance FROM candidate_policy_stances WHERE candidate_id = ?',
        [authUser.user_id]
      )
      const raw = rows[0]?.policy_stance
      if (raw == null) return []
      const value = typeof raw === 'string' ? JSON.parse(raw) : raw
      return normalizePolicyStance(value)
    })

    return NextResponse.json({ policy_stance: policyStance })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req)
    const authUser = getUserFromAccessToken(accessToken)
    if (!authUser) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const isVerified = await ensureVerifiedCandidate(authUser.user_id, authUser.user_email)
    if (!isVerified) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const body = await req.json()
    const policyStance = normalizePolicyStance(body.policy_stance)

    const value = policyStance.length > 0 ? JSON.stringify(policyStance) : null

    await withDatabase(async (db) => {
      await db.query(
        `INSERT INTO candidate_policy_stances (candidate_id, policy_stance)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE policy_stance = VALUES(policy_stance)`,
        [authUser.user_id, value]
      )
    })

    return NextResponse.json({ policy_stance: policyStance })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
