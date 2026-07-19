import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getParty, submitPartyRSVPs, RSVPData } from '@/lib/sheets'

// One invite link (token) covers the whole party, so members are identified
// by name; the party token always comes from the session, never the client.
interface SubmissionEntry {
  name: string
  attendance: RSVPData['attendance']
  dietary: string
  allergies: string
  transport: string
  transport_home: string
}

export async function POST(req: NextRequest) {
  // 1. Verify the session cookie
  const sessionCookie = req.cookies.get('guava_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let sessionToken: string
  try {
    const { payload } = await jwtVerify(
      sessionCookie,
      new TextEncoder().encode(process.env.SESSION_SECRET!)
    )
    sessionToken = (payload as { token: string }).token
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // 2. Load the party that belongs to this session token
  const party = await getParty(sessionToken)
  if (party.length === 0) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  const memberByName = new Map(party.map((g) => [g.name, g]))

  // 3. Parse and validate the request body
  let submissions: SubmissionEntry[]
  try {
    const body = await req.json()
    submissions = body.submissions
    if (!Array.isArray(submissions) || submissions.length === 0) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 4. Every submitted name must belong to the session's party
  const unauthorized = submissions.find((s) => !memberByName.has(s.name))
  if (unauthorized) {
    return NextResponse.json({ error: 'Forbidden: guest not in party' }, { status: 403 })
  }

  // 5. Build full RSVPData objects — all rows carry the shared party token
  const now = new Date().toISOString()

  const rsvps: RSVPData[] = submissions.map((s) => ({
    guest_token:    sessionToken,
    name:           s.name,
    attendance:     s.attendance,
    dietary:        s.dietary?.trim() ?? '',
    allergies:      s.allergies?.trim() ?? '',
    transport:      s.transport?.trim() ?? '',
    transport_home: s.transport_home?.trim() ?? '',
    submitted_at:   now,
  }))

  // 6. Write to Sheets
  await submitPartyRSVPs(rsvps)

  return NextResponse.json({ ok: true })
}
