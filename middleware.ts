import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/api/auth"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page and auth API through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check auth cookie
  const auth = req.cookies.get("site_auth")?.value
  if (auth === "1") {
    return NextResponse.next()
  }

  // Redirect to login
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
