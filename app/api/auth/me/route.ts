import { withDatabase } from "@/lib/db"
import { decode, sign, verify } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_token_secret"
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret"

const isTokenExpired = (token: string): boolean => {
  const decoded = decode(token) as { exp?: number } | null
  if (!decoded?.exp) return true
  return decoded.exp < Date.now() / 1000
};

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token } = await req.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ is_authenticated: false })
    }

    if (isTokenExpired(refresh_token)) {
      return NextResponse.json({ is_authenticated: false })
    }

    let validAccessToken = access_token;
    if (isTokenExpired(access_token)) {
      const refreshPayload = verify(refresh_token, REFRESH_SECRET) as {
        user_id: string
        user_email: string
      };

      validAccessToken = sign(
        { user_id: refreshPayload.user_id, user_email: refreshPayload.user_email },
        ACCESS_SECRET,
        { expiresIn: "1d" }
      );
    }

    
    const payload = verify(validAccessToken, ACCESS_SECRET) as {
      user_id: string
      user_email: string
    };

    const user = await withDatabase(async (db) => {
      const [rows]: any = await db.query("SELECT * FROM candidates WHERE email = ?", [
        payload.user_email,
      ]);
      return rows[0] || null
    })

    if (!user || user.id !== payload.user_id || !user.is_verified) {
      return NextResponse.json({ is_authenticated: false })
    }

    return NextResponse.json({
      user_id: payload.user_id,
      user_email: payload.user_email,
      user_name: user.username != null ? String(user.username) : '',
      user_is_verified: Boolean(user.is_verified),
      user_role: user.role,
      is_authenticated: true,
      access_token: validAccessToken,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}