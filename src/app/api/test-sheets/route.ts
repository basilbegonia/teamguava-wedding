import { getGuests } from '@/lib/sheets'

export async function GET() {
  const guests = await getGuests()
  return Response.json({ count: guests.length, guests })
}
