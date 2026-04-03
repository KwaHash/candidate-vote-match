import { withDatabase } from "@/lib/db"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { NextResponse } from "next/server"

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_token_secret"
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret"

const createTokens = (userId: number, userEmail: string) => {
  const payload = { user_id: userId, user_email: userEmail };
  return {
    access_token: sign(payload, ACCESS_SECRET, { expiresIn: "1d" }),
    refresh_token: sign(payload, REFRESH_SECRET, { expiresIn: "7d" }),
  };
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です。" },
        { status: 400 }
      );
    }

    const user = await withDatabase(async (db) => {
      const [rows]: any = await db.query(
        "SELECT id, email, password, is_verified FROM candidates WHERE email = ?",
        [email]
      );
      return rows[0] || null;
    });

    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスが正しくありません。" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "パスワードが正しくありません。" },
        { status: 401 }
      );
    }

    if (!user.is_verified) {
      return NextResponse.json(
        { error: "管理者により許可されておりませんので、管理者へお問い合わせください。" },
        { status: 401 }
      );
    }

    const tokens = createTokens(user.id, user.email);
    return NextResponse.json(tokens);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}