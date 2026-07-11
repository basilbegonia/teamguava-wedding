import { google } from 'googleapis'
import { Readable } from 'stream'

function getDriveClient() {
  // Drive can use its own service account (e.g. a Shared Drive under a different
  // Google account); falls back to the main service account if those aren't set.
  const email =
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL ??
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY ??
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  )?.replace(/\\n/g, '\n')

  const auth = new google.auth.JWT({
    email,
    key,
    // Full drive scope so the service account can write into a Shared Drive
    // folder it's a member of.
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

export async function uploadImageToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const drive = getDriveClient()
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id,webViewLink',
    // Required for uploads that target a Shared Drive.
    supportsAllDrives: true,
  })

  return res.data.webViewLink ?? `https://drive.google.com/file/d/${res.data.id}/view`
}
