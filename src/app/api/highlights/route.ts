import { NextResponse } from 'next/server'
import { getResponseHighlights } from '@/lib/sheets'

export async function GET() {
  try {
    const highlights = await getResponseHighlights()
    return NextResponse.json({ highlights })
  } catch {
    return NextResponse.json({ highlights: [] })
  }
}
