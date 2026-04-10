import { google } from 'googleapis'
import { unstable_cache, revalidateTag } from 'next/cache'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!
const GUESTS_RANGE = 'Guests!A:E'
const RSVPS_RANGE = 'RSVPs!A:G'

// Column indices — Guests tab
// A=name, B=email, C=token, D=visited_at, E=rsvp_submitted_at
const G = { name: 0, email: 1, token: 2, visited_at: 3, rsvp_submitted_at: 4 }

// Column indices — RSVPs tab
// A=guest_token, B=name, C=attendance, D=dietary, E=allergies, F=transport, G=submitted_at
const R = {
  guest_token: 0,
  name: 1,
  attendance: 2,
  dietary: 3,
  allergies: 4,
  transport: 5,
  submitted_at: 6,
}

export interface Guest {
  name: string
  email: string
  token: string
  visited_at: string
  rsvp_submitted_at: string
}

export interface RSVPData {
  guest_token: string
  name: string
  attendance: 'ceremony_and_reception' | 'ceremony_only' | 'not_coming'
  dietary: string
  allergies: string
  transport: string
  submitted_at: string
}

function getAuthClient() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuthClient() })
}

// Reads all guest rows. Cached with a 5-minute TTL — tag: 'guests'
export const getGuests = unstable_cache(
  async (): Promise<Guest[]> => {
    const sheets = getSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: GUESTS_RANGE,
    })
    const rows = res.data.values ?? []
    // Skip header row
    return rows.slice(1).map((row) => ({
      name: row[G.name] ?? '',
      email: row[G.email] ?? '',
      token: row[G.token] ?? '',
      visited_at: row[G.visited_at] ?? '',
      rsvp_submitted_at: row[G.rsvp_submitted_at] ?? '',
    }))
  },
  ['guests'],
  { revalidate: 300, tags: ['guests'] }
)

// Finds guest row by token and writes the current timestamp to visited_at (column D).
// Invalidates the guests cache after writing.
export async function markVisited(token: string): Promise<void> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: GUESTS_RANGE,
  })
  const rows = res.data.values ?? []
  // Row 0 is the header; data starts at row index 1 → sheet row 2
  const rowIndex = rows.findIndex(
    (row, i) => i > 0 && row[G.token] === token
  )
  if (rowIndex === -1) return

  const sheetRowNumber = rowIndex + 1 // 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Guests!D${sheetRowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[new Date().toISOString()]] },
  })

  revalidateTag('guests')
}

// Appends a new row to the RSVPs tab.
export async function appendRSVP(data: RSVPData): Promise<void> {
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RSVPS_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        data.guest_token,
        data.name,
        data.attendance,
        data.dietary,
        data.allergies,
        data.transport,
        data.submitted_at,
      ]],
    },
  })
}

// Finds the existing RSVP row by guest_token and overwrites it.
export async function updateRSVP(
  token: string,
  data: Omit<RSVPData, 'guest_token'>
): Promise<void> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RSVPS_RANGE,
  })
  const rows = res.data.values ?? []
  const rowIndex = rows.findIndex(
    (row, i) => i > 0 && row[R.guest_token] === token
  )
  if (rowIndex === -1) {
    // No existing row — fall back to append
    await appendRSVP({ guest_token: token, ...data })
    return
  }

  const sheetRowNumber = rowIndex + 1 // 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `RSVPs!A${sheetRowNumber}:G${sheetRowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        token,
        data.name,
        data.attendance,
        data.dietary,
        data.allergies,
        data.transport,
        data.submitted_at,
      ]],
    },
  })
}

// Returns the existing RSVP row for a guest token, or null if not found.
export async function getRSVP(token: string): Promise<RSVPData | null> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RSVPS_RANGE,
  })
  const rows = res.data.values ?? []
  const row = rows.find((r, i) => i > 0 && r[R.guest_token] === token)
  if (!row) return null
  return {
    guest_token: row[R.guest_token] ?? '',
    name: row[R.name] ?? '',
    attendance: row[R.attendance] as RSVPData['attendance'],
    dietary: row[R.dietary] ?? '',
    allergies: row[R.allergies] ?? '',
    transport: row[R.transport] ?? '',
    submitted_at: row[R.submitted_at] ?? '',
  }
}
