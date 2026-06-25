import { getAccessTokenFromRequest, getUserFromAccessToken } from '@/lib/auth'
import { withDatabase } from '@/lib/db'
import {
  type ICandidateProfile,
  type ProfileCustomItem,
  type ProfileWebsiteLink
} from '@/types/type.profile'
import { isProfileAvatarValue } from '@/utils/util.profile'
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
    avatar: String(row.avatar ?? ''),
    party: String(row.party ?? ''),
    birth_date: String(row.birth_date ?? ''),
    election_level: String(row.election_level ?? ''),
    district: String(row.district ?? ''),
    position: String(row.position ?? ''),
    education: String(row.education ?? ''),
    career: String(row.career ?? ''),
    political_career: String(row.political_career ?? ''),
    achievements: parseJsonField<string[]>(row.achievements) ?? undefined,
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

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req)
    const authUser = getUserFromAccessToken(accessToken)
    if (!authUser) {
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

    const body = await req.json()
    const validationError = validateProfileBody(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const profile: ICandidateProfile = {
      kanji_name: String(body.kanji_name).trim(),
      hiragana_name: String(body.hiragana_name).trim(),
      avatar: String(body.avatar).trim(),
      party: String(body.party).trim(),
      birth_date: String(body.birth_date).trim(),
      election_level: String(body.election_level).trim(),
      district: String(body.district).trim(),
      position: String(body.position).trim(),
      education: String(body.education).trim(),
      career: String(body.career).trim(),
      political_career: String(body.political_career).trim(),
      achievements: Array.isArray(body.achievements) ? body.achievements : undefined,
      website: Array.isArray(body.website) ? body.website : undefined,
      custom_items: Array.isArray(body.custom_items) ? body.custom_items : undefined,
    }

    await withDatabase(async (db) => {
      const values = [
        profile.kanji_name,
        profile.hiragana_name,
        profile.avatar,
        profile.party,
        profile.birth_date,
        profile.election_level,
        profile.district,
        profile.position,
        profile.education,
        profile.career,
        profile.political_career,
        profile.achievements ? JSON.stringify(profile.achievements) : null,
        profile.website ? JSON.stringify(profile.website) : null,
        profile.custom_items ? JSON.stringify(profile.custom_items) : null,
      ]

      await db.query(
        `INSERT INTO candidate_profiles (
          candidate_id, kanji_name, hiragana_name, avatar, party, birth_date,
          election_level, district, position, education, career, political_career,
          achievements, website, custom_items
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          kanji_name = VALUES(kanji_name),
          hiragana_name = VALUES(hiragana_name),
          avatar = VALUES(avatar),
          party = VALUES(party),
          birth_date = VALUES(birth_date),
          election_level = VALUES(election_level),
          district = VALUES(district),
          position = VALUES(position),
          education = VALUES(education),
          career = VALUES(career),
          political_career = VALUES(political_career),
          achievements = VALUES(achievements),
          website = VALUES(website),
          custom_items = VALUES(custom_items)`,
        [authUser.user_id, ...values]
      )
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
