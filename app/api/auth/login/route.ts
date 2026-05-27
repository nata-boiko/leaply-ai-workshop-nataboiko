import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string }
  const correct = process.env.SITE_PASSWORD

  if (!correct || password !== correct) {
    return NextResponse.json({ error: "Невірний пароль" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("site_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}
