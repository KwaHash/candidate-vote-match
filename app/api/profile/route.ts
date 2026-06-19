import { getAccessTokenFromRequest, getUserFromAccessToken } from '@/lib/auth'
import { withDatabase } from '@/lib/db'
import {
  isProfileAvatarValue,
  type ICandidateProfile,
  type ProfileCustomItem,
  type ProfileQuestionAnswer,
  type ProfileWebsiteLink,
} from '@/types/profile'
import { NextRequest, NextResponse } from 'next/server'

const REQUIRED_FIELDS = [
  'kanji_name',
  'hiragana_name',
  'party',
  'birth_date',
  'avatar',
] as const

function parseJsonField<T>(value: unknown): T | null {
  if (value == null) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return value as T
}

function rowToProfile(row: Record<string, unknown>): ICandidateProfile {
  return {
    kanji_name: String(row.kanji_name ?? ''),
    hiragana_name: String(row.hiragana_name ?? ''),
    party: String(row.party ?? ''),
    birth_date: String(row.birth_date ?? ''),
    avatar: String(row.avatar ?? ''),
    title: row.title != null ? String(row.title) : undefined,
    origin: row.origin != null ? String(row.origin) : undefined,
    biography: row.biography != null ? String(row.biography) : undefined,
    question_answers: parseJsonField<ProfileQuestionAnswer[]>(row.question_answers) ?? undefined,
    website: parseJsonField<ProfileWebsiteLink[]>(row.website) ?? undefined,
    custom_items: parseJsonField<ProfileCustomItem[]>(row.custom_items) ?? undefined,
  }
}

function validateProfileBody(body: Record<string, unknown>): string | null {
  for (const field of REQUIRED_FIELDS) {
    const value = body[field]
    if (value == null || String(value).trim() === '') {
      return `${field} は必須です。`
    }
  }
  const birthDate = String(body.birth_date).trim()
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(birthDate)) {
    return '生年月日は YYYY/MM/DD 形式で入力してください。'
  }
  if (!isProfileAvatarValue(String(body.avatar ?? ''))) {
    return 'プロフィール画像は必須です。'
  }
  return null
}

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

    const profile = await withDatabase(async (db) => {
      const [rows]: any = await db.query(
        'SELECT * FROM candidate_profiles WHERE candidate_id = ?',
        [authUser.user_id]
      )
      const row = rows[0]
      return row ? rowToProfile(row) : null
    })

    return NextResponse.json({ profile })
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
    const validationError = validateProfileBody(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const profile: ICandidateProfile = {
      kanji_name: String(body.kanji_name).trim(),
      hiragana_name: String(body.hiragana_name).trim(),
      party: String(body.party).trim(),
      birth_date: String(body.birth_date).trim(),
      avatar: String(body.avatar).trim(),
      title: body.title != null ? String(body.title).trim() || undefined : undefined,
      origin: body.origin != null ? String(body.origin).trim() || undefined : undefined,
      biography: body.biography != null ? String(body.biography).trim() || undefined : undefined,
      question_answers: Array.isArray(body.question_answers) ? body.question_answers : undefined,
      website: Array.isArray(body.website) ? body.website : undefined,
      custom_items: Array.isArray(body.custom_items) ? body.custom_items : undefined,
    }

    await withDatabase(async (db) => {
      const [existing]: any = await db.query(
        'SELECT id FROM candidate_profiles WHERE candidate_id = ?',
        [authUser.user_id]
      )

      const values = [
        profile.kanji_name,
        profile.hiragana_name,
        profile.party,
        profile.birth_date,
        profile.avatar,
        profile.title ?? null,
        profile.origin ?? null,
        profile.biography ?? null,
        profile.question_answers ? JSON.stringify(profile.question_answers) : null,
        profile.website ? JSON.stringify(profile.website) : null,
        profile.custom_items ? JSON.stringify(profile.custom_items) : null,
      ]

      if (existing[0]) {
        await db.query(
          `UPDATE candidate_profiles SET
            kanji_name = ?, hiragana_name = ?, party = ?, birth_date = ?, avatar = ?,
            title = ?, origin = ?, biography = ?, question_answers = ?, website = ?, custom_items = ?
          WHERE candidate_id = ?`,
          [...values, authUser.user_id]
        )
      } else {
        await db.query(
          `INSERT INTO candidate_profiles (
            candidate_id, kanji_name, hiragana_name, party, birth_date, avatar,
            title, origin, biography, question_answers, website, custom_items
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [authUser.user_id, ...values]
        )
      }
    })

    return NextResponse.json({ profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
