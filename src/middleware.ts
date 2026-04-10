import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/invite']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get('guava_session')?.value
  if (!token) return NextResponse.redirect(new URL('/invite/error', req.url))

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET!))
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/invite/error', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
