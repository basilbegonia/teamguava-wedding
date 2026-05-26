import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { getParty, getPartyRSVPs } from '@/lib/sheets'
import RSVPForm from '@/components/RSVPForm'

export const dynamic = 'force-dynamic'

export default async function RsvpPage() {
  // Read & verify the session JWT
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('guava_session')?.value
  if (!sessionCookie) redirect('/invite/error')

  let guestToken: string
  try {
    const { payload } = await jwtVerify(
      sessionCookie,
      new TextEncoder().encode(process.env.SESSION_SECRET!)
    )
    guestToken = (payload as { token: string }).token
  } catch {
    redirect('/invite/error')
  }

  // Fetch all members of this guest's party (may be just the one guest)
  const party = await getParty(guestToken)
  if (party.length === 0) redirect('/invite/error')

  // Fetch any existing RSVPs for each party member in one Sheets call
  const existingRsvps = await getPartyRSVPs(party.map((g) => g.token))

  return (
    <RSVPForm
      party={party}
      existingRsvps={existingRsvps}
    />
  )
}
