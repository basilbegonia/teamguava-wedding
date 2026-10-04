import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getConnections } from '@/lib/sheets'
import ConnectionsGraph from '@/components/ConnectionsGraph'

export const dynamic = 'force-dynamic'

export default async function ConnectionsPage() {
  const connections = await getConnections()

  // Pull the viewer's name from the session (no sheet call) to highlight
  // their own node in the web.
  let viewerName = ''
  try {
    const sessionCookie = cookies().get('guava_session')?.value
    if (sessionCookie) {
      const { payload } = await jwtVerify(
        sessionCookie,
        new TextEncoder().encode(process.env.SESSION_SECRET!)
      )
      viewerName = (payload as { name?: string }).name ?? ''
    }
  } catch {
    // Not signed in cleanly — graph still renders, just without a "you" marker.
  }

  return (
    <div className="flex flex-1 flex-col bg-cream text-forest">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Link
          href="/"
          className="font-sans text-sm text-terracotta underline underline-offset-2"
        >
          ← back
        </Link>
        <div className="flex-1 text-center">
          <h1 className="font-serif text-xl font-bold leading-none">The Guava Web</h1>
          <p className="font-sans text-xs text-forest/55">how we all know each other</p>
        </div>
        {/* spacer to balance the back link */}
        <span className="w-10" aria-hidden />
      </div>

      <ConnectionsGraph connections={connections} viewerName={viewerName} />
    </div>
  )
}
