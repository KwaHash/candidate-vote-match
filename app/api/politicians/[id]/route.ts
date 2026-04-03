import { withDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
  const { id } = params

  try {
    const { politician, adjacent } = await withDatabase(async (db) => {
      const [rows]: any = await db.query('SELECT * FROM representatives2026 WHERE id = ?', [id])
      const politician = rows[0] || null

      let adjacent: any[] = []
      if (politician?.district) {
        const [adjRows]: any = await db.query(
          'SELECT * FROM representatives2026 WHERE district = ? AND id != ? ORDER BY id ASC',
          [politician.district, id]
        )
        adjacent = adjRows || []
      }

      return { politician, adjacent }
    })

    return NextResponse.json({ politician, adjacent })
  } catch (error) {
    console.error('Error fetching representatives2026:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' }, { status: 500 }
    )
  }
}
