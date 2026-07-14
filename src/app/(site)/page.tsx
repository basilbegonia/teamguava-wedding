import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getParty, getPartyRSVPs, type Guest, type RSVPData } from '@/lib/sheets'
import HeroSection from '@/components/HeroSection'
import StorySection from '@/components/StorySection'
import OurStorySection from '@/components/OurStorySection'
import ScheduleSection from '@/components/ScheduleSection'
import RSVPForm from '@/components/RSVPForm'
import SurveySection from '@/components/SurveySection'
import DressCodeSection from '@/components/DressCodeSection'
import DesktopQRGate from '@/components/DesktopQRGate'

export const dynamic = 'force-dynamic'

export default async function SpaPage() {
  // Fetch party + existing RSVPs for the current guest so the RSVP section
  // can be pre-filled. Middleware already guarantees a valid session exists.
  let party: Guest[] = []
  let existingRsvps: (RSVPData | null)[] = []
  let guestToken = ''

  try {
    const sessionCookie = cookies().get('guava_session')?.value
    if (sessionCookie) {
      const { payload } = await jwtVerify(
        sessionCookie,
        new TextEncoder().encode(process.env.SESSION_SECRET!)
      )
      guestToken = (payload as { token: string }).token
      party = await getParty(guestToken)
      existingRsvps = await getPartyRSVPs(party.map((g) => g.token))
    }
  } catch {
    // Middleware handles invalid sessions; degrade gracefully here
  }

  return (
    <>
      <DesktopQRGate token={guestToken} />
      <HeroSection />
      <StorySection />
      <ScheduleSection />
      <RSVPForm party={party} existingRsvps={existingRsvps} />
      <SurveySection rsvped={existingRsvps.some((r) => r !== null)} />
      <DressCodeSection />
      <OurStorySection />
    </>
  )
}
