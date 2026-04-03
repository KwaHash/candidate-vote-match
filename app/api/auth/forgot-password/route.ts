import { withDatabase } from "@/lib/db"
import sgMail from "@sendgrid/mail"
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'メールアドレスは必須です。' }, { status: 400 })
    }

    const user = await withDatabase(async (db) => {
      const [users]: any = await db.query('SELECT id FROM candidates WHERE email = ?', [email])
      return users.length === 1 ? users[0] : null
    })

    if (!user) {
      return NextResponse.json({ success: true }) // Don't reveal registered/not
    }
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`

    const msg = {
      from: {
        email: process.env.SENDGRID_EMAIL_ADDRESS!,
        name: process.env.SENDGRID_EMAIL_NAME,
      },
      to: email,
      subject: '[わたしの政治]パスワード再設定のご案内',
      html: `
        <div style="margin: 24px 0; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <p style="font-size: 16px;">
            パスワードをリセットするには次のアドレスを開いてください。<br />
            リセットしない場合はこのメールを無視してください。
          </p>
          <a 
            style="
              display: inline-block;
              padding: 14px 28px;
              background: #0166d6;
              color: #fff;
              border-radius: 4px;
              text-decoration: none;
              font-weight: bold;
              font-size: 15px;
              text-align: center;
            "
            href="${resetUrl}"
            target="_blank"
          >
            パスワードをリセットする
          </a>
          <p style="font-size: 14px; color: #777;">
            なお、こちらのリンクは1回限り有効で、1時間後に無効となりますのでご注意ください。<br>
            万が一ボタンがクリックできない場合は、下記URLをブラウザに貼り付けてください：<br>
            <span style="word-break:break-all; color: #333;">${resetUrl}</span>
          </p>
        </div>
      `,
      tracking_settings: {
        click_tracking: {
          enable: false,
        },
      },
    }

    await sgMail.send(msg)
    await withDatabase(async (db) => {
      await db.query('INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expires])
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}

