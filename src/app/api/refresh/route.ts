import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * Manually flush every cached Sheets read (guest list, RSVPs, highlights).
 * Useful after editing the Google Sheet by hand — otherwise reads refresh on
 * their own TTLs (guests 5 min, RSVPs 60s, highlights 30s).
 *
 * Access is gated by the middleware: only visitors with a valid invite
 * session can reach this route.
 */
export async function GET() {
  revalidateTag('guests')
  revalidateTag('rsvps')
  revalidateTag('response-highlights')
  return NextResponse.json({
    ok: true,
    refreshed: ['guests', 'rsvps', 'response-highlights'],
    at: new Date().toISOString(),
  })
}
