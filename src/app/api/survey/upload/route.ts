import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { uploadImageToDrive } from '@/lib/drive'

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('guava_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await jwtVerify(sessionCookie, new TextEncoder().encode(process.env.SESSION_SECRET!))
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadImageToDrive(buffer, file.name, file.type)

  return NextResponse.json({ url })
}
