import { withDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const district = searchParams.get('district')
    const party = searchParams.get('party')
    const filterByParty = party && party !== '全て政党'

    const politicians = await withDatabase(async (db) => {
      const query = filterByParty
        ? 'SELECT * FROM representatives2026 WHERE district = ? AND party = ? ORDER BY CASE vote_result WHEN 1 THEN 0 WHEN 2 THEN 1 ELSE 2 END, vote_count DESC'
        : 'SELECT * FROM representatives2026 WHERE district = ? ORDER BY CASE vote_result WHEN 1 THEN 0 WHEN 2 THEN 1 ELSE 2 END, vote_count DESC'
      const params = filterByParty ? [district, party] : [district]
      const [rows] = await db.query(query, params)
      return rows
    })

    return NextResponse.json({ politicians })
  } catch (error) {
    console.error('Error fetching politicians:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' }, { status: 500 }
    )
  }
}
