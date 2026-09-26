// Mirrors records to a Google Sheet via a Google Apps Script Web App webhook.
// Best-effort only: localStorage is the source of truth, this never blocks
// or breaks the UI if the network call fails or isn't configured yet.

export type SheetName = 'Finance' | 'Tasks' | 'Workouts'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL
const TOKEN = process.env.NEXT_PUBLIC_SHEETS_TOKEN ?? ''

export function isSyncConfigured(): boolean {
  return Boolean(WEBHOOK_URL)
}

export function syncToSheet(sheet: SheetName, action: 'upsert' | 'delete', data: object) {
  if (!WEBHOOK_URL) return

  // text/plain avoids a CORS preflight (Apps Script doesn't handle OPTIONS);
  // the body is still parsed as JSON server-side.
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: TOKEN, sheet, action, ...data }),
  }).catch(() => {
    // Silently ignore — the record already lives in localStorage.
  })
}
