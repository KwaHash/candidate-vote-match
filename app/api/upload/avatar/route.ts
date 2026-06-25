import { getAccessTokenFromRequest, getUserFromAccessToken } from '@/lib/auth'
import { MAX_PROFILE_AVATAR_SIZE_BYTES, PROFILE_AVATAR_MIME_EXT } from '@/utils/util.profile'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export const runtime = 'nodejs'

const FACES_DIR = path.join(process.cwd(), 'public', 'faces')

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req)
    const authUser = getUserFromAccessToken(accessToken)
    if (!authUser) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '画像ファイルを選択してください。' },
        { status: 400 }
      )
    }

    const ext = PROFILE_AVATAR_MIME_EXT[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'JPEG、PNG、WebP、GIF形式の画像を選択してください。' },
        { status: 400 }
      )
    }
    if (file.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
      return NextResponse.json(
        { error: '2MB以下の画像を選択してください。' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${randomUUID()}.${ext}`
    await mkdir(FACES_DIR, { recursive: true })
    await writeFile(path.join(FACES_DIR, fileName), buffer)

    return NextResponse.json({ path: `/faces/${fileName}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
