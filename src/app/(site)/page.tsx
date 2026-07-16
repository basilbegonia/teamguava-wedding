import { Suspense } from 'react'
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

/**
 * The only part of the page that needs Google Sheets. It streams in after the
 * static shell, so first paint never waits on the Sheets API.
 */
async function RSVPBlock({ token }: { token: string }) {
  let party: Guest[] = []
  let existingRsvps: (RSVPData | null)[] = []

  try {
    if (token) {
      party = await getParty(token)
      existingRsvps = await getPartyRSVPs(party.map((g) => g.token))
    }
  } catch {
    // Degrade gracefully — the form renders empty and the guest can retry.
  }

  return (
    <>
      <RSVPForm party={party} existingRsvps={existingRsvps} />
      <SurveySection rsvped={existingRsvps.some((r) => r !== null)} />
    </>
  )
}

function RSVPFallback() {
  return (
    <div
      id="rsvp"
      className="bg-cream text-forest flex flex-col items-center justify-center px-5 py-16 min-h-[60svh]"
    >
      <h2 className="font-serif text-3xl font-bold">RSVP</h2>
      <p className="font-sans text-sm text-forest/50 mt-3 animate-pulse">
        loading your invite…
      </p>
    </div>
  )
}

export default async function SpaPage() {
  // Verify the session locally (no network) — just to get the guest token.
  // Middleware already guarantees a valid session exists.
  let guestToken = ''
  try {
    const sessionCookie = cookies().get('guava_session')?.value
    if (sessionCookie) {
      const { payload } = await jwtVerify(
        sessionCookie,
        new TextEncoder().encode(process.env.SESSION_SECRET!)
      )
      guestToken = (payload as { token: string }).token
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
      <Suspense fallback={<RSVPFallback />}>
        <RSVPBlock token={guestToken} />
      </Suspense>
      <DressCodeSection />
      <OurStorySection />
    </>
  )
}
