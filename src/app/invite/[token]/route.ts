import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { getGuests, markVisited } from '@/lib/sheets'

function baseUrl(request: NextRequest): string {
  const host = request.headers.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  let guests
  try {
    guests = await getGuests()
  } catch {
    // Sheets unreachable / rate-limited — not the guest's fault.
    return NextResponse.redirect(`${baseUrl(request)}/invalid-link?e=1`)
  }

  const guest = guests.find((g) => g.token === token)

  if (!guest) {
    return NextResponse.redirect(`${baseUrl(request)}/invalid-link`)
  }

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)
  const jwt = await new SignJWT({ name: guest.name, token })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('180d')
    .sign(secret)

  const response = NextResponse.redirect(`${baseUrl(request)}/`)
  response.cookies.set('guava_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 180, // ~6 months
    path: '/',
  })

  // Write visited_at — don't block the redirect
  markVisited(token).catch(console.error)

  return response
}
