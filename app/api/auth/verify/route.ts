import { NextResponse } from 'next/server'
import { withDatabase } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: '認証トークンが必要です。' }, { status: 400 })
    }
    const row = await withDatabase(async (db) => {
      const [users]: any = await db.query("SELECT user_id, expires_at FROM verification_tokens WHERE token = ?", [token])
      return users.length === 1 ? users[0] : null
    })
    if (!row || new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: 'トークンが無効、または有効期限切れです。' }, { status: 400 })
    }

    await withDatabase(async (db) => {
      await db.query('DELETE FROM verification_tokens WHERE token = ?', [token])
    })
    return NextResponse.json({ user_id: row.user_id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}

