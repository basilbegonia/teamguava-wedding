import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { submitSurveyResponse } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('guava_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let guestToken: string
  let guestName: string
  try {
    const { payload } = await jwtVerify(
      sessionCookie,
      new TextEncoder().encode(process.env.SESSION_SECRET!)
    )
    const p = payload as { token: string; name: string }
    guestToken = p.token
    guestName = p.name
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  let body: { step: string; response: unknown; anonymous?: boolean }
  try {
    body = await req.json()
    if (!body.step || body.response === undefined) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Turn the step payload into plain, human-readable columns for the sheet.
  const r =
    typeof body.response === 'object' && body.response !== null
      ? (body.response as Record<string, unknown>)
      : {}

  let response = ''
  let photo = ''
  if (body.step === 'yummy') {
    response = Array.isArray(r.snacks) ? (r.snacks as string[]).join(', ') : ''
  } else if (body.step === 'sweet') {
    response = typeof r.memory === 'string' ? r.memory : ''
    photo = typeof r.image_url === 'string' ? r.image_url : ''
  } else if (body.step === 'spicy') {
    response = typeof r.question === 'string' ? r.question : ''
  } else {
    response =
      typeof body.response === 'string' ? body.response : JSON.stringify(body.response)
  }

  await submitSurveyResponse({
    guest_token: body.anonymous ? 'anonymous' : guestToken,
    guest_name:  body.anonymous ? 'Anonymous'  : guestName,
    step:        body.step,
    response,
    photo,
  })

  return NextResponse.json({ ok: true })
}
