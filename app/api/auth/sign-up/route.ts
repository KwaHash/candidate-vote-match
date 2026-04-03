import { withDatabase } from "@/lib/db"
import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 })
    }
    const users = await withDatabase(async (db) => {
      const [rows]: any = await db.query("SELECT * FROM candidates WHERE email = ?", [email])
      return rows
    })
    
    if ((users as any[]).length > 0) {
      return NextResponse.json({ error: 'このメールアドレスは既に登録されています。' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user_id = await withDatabase(async (db) => {
      const [result] = await db.query('INSERT INTO candidates (email, password) VALUES (?, ?)', [email, hash])
      return (result as any).insertId
    })

    return NextResponse.json({ user_id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}