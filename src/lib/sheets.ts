import { google } from 'googleapis'
import { unstable_cache, revalidateTag } from 'next/cache'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!
const GUESTS_RANGE = 'Guests!A:F'
const RSVPS_RANGE = 'RSVPs!A:G'

// Column indices — Guests tab
// A=name, B=email, C=token, D=visited_at, E=rsvp_submitted_at, F=party_id
const G = { name: 0, email: 1, token: 2, visited_at: 3, rsvp_submitted_at: 4, party_id: 5 }

// Column indices — RSVPs tab
// A=guest_token, B=name, C=attendance, D=dietary, E=allergies, F=transport, G=transport_home, H=submitted_at
const R = {
  guest_token: 0,
  name: 1,
  attendance: 2,
  dietary: 3,
  allergies: 4,
  transport: 5,
  transport_home: 6,
  submitted_at: 7,
}

export interface Guest {
  name: string
  email: string
  token: string
  visited_at: string
  rsvp_submitted_at: string
  /** Guests sharing the same non-empty party_id are in one household. */
  party_id: string
}

export interface RSVPData {
  guest_token: string
  name: string
  attendance: 'ceremony_and_reception' | 'ceremony_only' | 'not_coming'
  dietary: string
  allergies: string
  transport: string
  transport_home: string
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
      party_id: row[G.party_id] ?? '',
    }))
  },
  ['guests'],
  { revalidate: 300, tags: ['guests'] }
)

/**
 * Returns all guests in the same party as the given token.
 * If the guest has no party_id, returns just that guest as a solo party.
 */
export async function getParty(token: string): Promise<Guest[]> {
  const guests = await getGuests()
  const guest = guests.find((g) => g.token === token)
  if (!guest) return []
  if (!guest.party_id) return [guest]
  return guests.filter((g) => g.party_id === guest.party_id)
}

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

/**
 * Marks rsvp_submitted_at (column E) for each of the given tokens in one
 * batchUpdate call. Invalidates the guests cache afterwards.
 */
export async function markRsvpSubmitted(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return

  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: GUESTS_RANGE,
  })
  const rows = res.data.values ?? []
  const now = new Date().toISOString()

  const updates = tokens
    .map((token) => {
      const rowIndex = rows.findIndex(
        (row, i) => i > 0 && row[G.token] === token
      )
      if (rowIndex === -1) return null
      return {
        range: `Guests!E${rowIndex + 1}`,
        values: [[now]],
      }
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)

  if (updates.length === 0) return

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  })

  revalidateTag('guests')
}

/**
 * Appends a new row to the RSVPs tab.
 * Prefer submitPartyRSVPs for batch writes.
 */
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
        data.transport_home,
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
    range: `RSVPs!A${sheetRowNumber}:H${sheetRowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        token,
        data.name,
        data.attendance,
        data.dietary,
        data.allergies,
        data.transport,
        data.transport_home,
        data.submitted_at,
      ]],
    },
  })
}

/**
 * Writes RSVPs for all party members in as few Sheets API calls as possible.
 * Existing rows are updated; new guests get appended rows.
 * After writing RSVPs, marks rsvp_submitted_at on the Guests tab for every token.
 */
export async function submitPartyRSVPs(rsvps: RSVPData[]): Promise<void> {
  if (rsvps.length === 0) return

  const sheets = getSheetsClient()

  // Read current RSVPs once
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RSVPS_RANGE,
  })
  const rows = res.data.values ?? []

  const toAppend: RSVPData[] = []
  const toUpdate: Array<{ rowNumber: number; data: RSVPData }> = []

  for (const rsvp of rsvps) {
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && row[R.guest_token] === rsvp.guest_token
    )
    if (rowIndex === -1) {
      toAppend.push(rsvp)
    } else {
      toUpdate.push({ rowNumber: rowIndex + 1, data: rsvp })
    }
  }

  // Batch-update existing RSVP rows
  if (toUpdate.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: toUpdate.map(({ rowNumber, data }) => ({
          range: `RSVPs!A${rowNumber}:H${rowNumber}`,
          values: [[
            data.guest_token,
            data.name,
            data.attendance,
            data.dietary,
            data.allergies,
            data.transport,
            data.transport_home,
            data.submitted_at,
          ]],
        })),
      },
    })
  }

  // Append brand-new RSVP rows in one request
  if (toAppend.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RSVPS_RANGE,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: toAppend.map((data) => [
          data.guest_token,
          data.name,
          data.attendance,
          data.dietary,
          data.allergies,
          data.transport,
          data.transport_home,
          data.submitted_at,
        ]),
      },
    })
  }

  // Mark rsvp_submitted_at for every party member
  await markRsvpSubmitted(rsvps.map((r) => r.guest_token))

  // New answers are live — drop the cached RSVP reads.
  revalidateTag('rsvps')
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
    transport_home: row[R.transport_home] ?? '',
    submitted_at: row[R.submitted_at] ?? '',
  }
}

const SURVEY_RANGE = 'Survey!A:F'
// A=timestamp, B=guest_token, C=guest_name, D=step, E=response (human-readable), F=photo URL

// Curated highlight responses shown under "Other people's responses".
// Text lives in column A of the "Response highlights" tab (row 1 = header).
const RESPONSE_HIGHLIGHTS_RANGE = "'Response highlights'!A:A"

// Cached with a 30s TTL so it reads semi-live without hammering the Sheets API.
export const getResponseHighlights = unstable_cache(
  async (): Promise<string[]> => {
    const sheets = getSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RESPONSE_HIGHLIGHTS_RANGE,
    })
    const rows = res.data.values ?? []
    return rows
      .slice(1) // skip header row
      .map((r) => (r[0] ?? '').toString().trim())
      .filter(Boolean)
  },
  ['response-highlights'],
  { revalidate: 30, tags: ['response-highlights'] }
)

export async function submitSurveyResponse(entry: {
  guest_token: string
  guest_name: string
  step: string
  response: string
  photo?: string
}): Promise<void> {
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SURVEY_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        new Date().toISOString(),
        entry.guest_token,
        entry.guest_name,
        entry.step,
        entry.response,
        entry.photo ?? '',
      ]],
    },
  })
}

/**
 * Fetches RSVPs for multiple tokens in a single Sheets read.
 * Returns an array in the same order as the input tokens.
 * Cached per party (args are part of the cache key) with a 60s TTL —
 * tag: 'rsvps', invalidated by submitPartyRSVPs.
 */
export const getPartyRSVPs = unstable_cache(
  async (tokens: string[]): Promise<(RSVPData | null)[]> => {
    if (tokens.length === 0) return []

  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RSVPS_RANGE,
  })
  const rows = res.data.values ?? []
  const tokenSet = new Set(tokens)
  const rsvpMap = new Map<string, RSVPData>()

  rows.slice(1).forEach((row) => {
    const t = row[R.guest_token]
    if (tokenSet.has(t)) {
      rsvpMap.set(t, {
        guest_token: t,
        name: row[R.name] ?? '',
        attendance: row[R.attendance] as RSVPData['attendance'],
        dietary: row[R.dietary] ?? '',
        allergies: row[R.allergies] ?? '',
        transport: row[R.transport] ?? '',
        transport_home: row[R.transport_home] ?? '',
        submitted_at: row[R.submitted_at] ?? '',
      })
    }
  })

    return tokens.map((t) => rsvpMap.get(t) ?? null)
  },
  ['party-rsvps'],
  { revalidate: 60, tags: ['rsvps'] }
)
