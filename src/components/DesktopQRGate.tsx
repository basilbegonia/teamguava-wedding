'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * On a desktop (large screen + mouse), nudge the guest to open the invite on
 * their phone by showing a scannable QR of their own invite link. The QR must
 * encode the /invite/<token> URL (not the current page) because the session
 * cookie is per-device — scanning re-runs the invite flow on the phone.
 */
export default function DesktopQRGate({ token }: { token: string }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!token) return
    setUrl(`${window.location.origin}/invite/${token}`)

    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [token])

  if (!isDesktop || dismissed || !url) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-forest px-8 text-center text-cream">
      <h2 className="font-serif text-3xl font-bold">Best viewed on your phone&nbsp;📱</h2>
      <p className="max-w-sm font-sans text-cream/80">
        Our invite is made for mobile. Point your phone&rsquo;s camera at the code
        below to open it there.
      </p>

      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <QRCodeSVG value={url} size={220} bgColor="#ffffff" fgColor="#4d573f" level="M" />
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="font-sans text-sm text-cream/50 underline underline-offset-2 hover:text-cream/80"
      >
        continue on this device anyway
      </button>
    </div>
  )
}
