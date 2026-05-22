#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

// Fetch + cheerio approach — kept for reference. NOT functional for this site because
// the category dropdown options and session tokens are JavaScript-rendered and not
// available in the raw HTML. Use scrape-hpcsa-doctors.ts (Puppeteer) instead.
//
// To run manually if needed:
//   DENO_TLS_CA_STORE=system deno run --allow-net --allow-read --allow-write --allow-env \
//   scripts/data-munging/scrape-hpcsa-doctors-fetch.ts

import * as cheerio from 'cheerio'

const FORM_URL = 'https://hpcsaonline.custhelp.com/app/i_reg_form'
const DELAY_MS = 300
const DATE_STAMP = new Date().toISOString().slice(0, 10)
const OUT_JSON = `db/resources/hpcsa_doctors_${DATE_STAMP}.json`
const OUT_CSV = `db/resources/hpcsa_doctors_${DATE_STAMP}.csv`
const CHECKPOINT = `db/resources/hpcsa_doctors_${DATE_STAMP}.checkpoint.json`

interface DoctorRecord {
  [column: string]: string
}

interface Checkpoint {
  completedCategories: string[]
  records: DoctorRecord[]
  headers: string[]
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function recordsToCsv(headers: string[], records: DoctorRecord[]): string {
  const lines = [headers.map(csvEscape).join(',')]
  for (const rec of records) {
    lines.push(headers.map((h) => csvEscape(rec[h] ?? '')).join(','))
  }
  return lines.join('\n')
}

async function loadCheckpoint(): Promise<Checkpoint> {
  try {
    return JSON.parse(await Deno.readTextFile(CHECKPOINT)) as Checkpoint
  } catch {
    return { completedCategories: [], records: [], headers: [] }
  }
}

async function saveCheckpoint(cp: Checkpoint): Promise<void> {
  await Deno.writeTextFile(CHECKPOINT, JSON.stringify(cp))
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------------------------------------------------------------------------
// Session: propagate cookies across requests
// ---------------------------------------------------------------------------

class Session {
  private cookies: Record<string, string> = {}

  updateCookies(response: Response): void {
    const raw = response.headers.getSetCookie?.() ?? []
    for (const cookie of raw) {
      const [pair] = cookie.split(';')
      const eq = pair.indexOf('=')
      if (eq !== -1) {
        this.cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim()
      }
    }
  }

  cookieHeader(): string {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  }

  async get(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'Cookie': this.cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (compatible; research-scraper)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    this.updateCookies(response)
    return response.text()
  }

  async post(url: string, body: URLSearchParams): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': this.cookieHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; research-scraper)',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': FORM_URL,
      },
      body: body.toString(),
    })
    this.updateCookies(response)
    return response.text()
  }
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

interface FormMeta {
  action: string
  method: string
  hiddenFields: Record<string, string>
  categoryOptions: { value: string; label: string }[]
  submitName?: string
  submitValue?: string
}

// Hardcoded from network payload inspection — both <select> elements have no name attribute,
// so field names and the register value are set by page JS at submission time.
// If fetch results return empty, re-inspect the Network tab payload for changes.
const REGISTER_FIELD_NAME = 'register'
const REGISTER_FIELD_VALUE = 'MEDICAL PRACTITIONER'
const CATEGORY_FIELD_NAME = 'category'

function extractFormMeta(html: string): FormMeta | null {
  const $ = cheerio.load(html)
  const form = $('form').first()
  if (!form.length) {
    console.error('ERROR: No <form> found on page')
    return null
  }

  const action = form.attr('action') ?? FORM_URL
  const method = (form.attr('method') ?? 'post').toLowerCase()

  // Hidden fields — picks up session tokens (rn_contextToken, rn_formToken, w_id, etc.)
  const hiddenFields: Record<string, string> = {}
  form.find('input[type="hidden"]').each((_, el) => {
    const name = $(el).attr('name')
    const value = $(el).attr('value') ?? ''
    if (name) hiddenFields[name] = value
  })

  // Category options are JS-rendered — not available in raw HTML.
  // The Puppeteer version must be used to obtain them.
  const categoryOptions: { value: string; label: string }[] = []

  // Submit button
  const submitBtn = form.find('input[type="submit"], button[type="submit"]').first()
  const submitName = submitBtn.attr('name')
  const submitValue = submitBtn.attr('value') ?? submitBtn.text().trim()

  console.error(`Form fields detected:`)
  console.error(`  action: ${action}`)
  console.error(`  category field: "${CATEGORY_FIELD_NAME}" (${categoryOptions.length} options)`)
  console.error(`  hidden fields: ${Object.keys(hiddenFields).join(', ')}`)

  return { action, method, hiddenFields, categoryOptions, submitName, submitValue }
}

function parseTableRows(html: string, existingHeaders: string[]): { headers: string[]; rows: DoctorRecord[] } {
  const $ = cheerio.load(html)
  const table = $('table').first()

  let headers = existingHeaders
  if (headers.length === 0) {
    headers = table.find('thead th').map((_, el) => $(el).text().trim()).get()
    if (headers.length === 0) {
      // Some tables use <tr> in tbody for header row
      headers = table.find('tr').first().find('th, td').map((_, el) => $(el).text().trim()).get()
    }
  }

  const rows: DoctorRecord[] = []
  const bodyRows = table.find('tbody tr')
  bodyRows.each((_, tr) => {
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get()
    if (cells.length === 0) return
    const record: DoctorRecord = {}
    headers.forEach((h, i) => { record[h] = cells[i] ?? '' })
    rows.push(record)
  })

  return { headers, rows }
}

// Find the pagination "next" link/button and return its URL or form params
function findNextPage(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html)
  // Look for a link or button labelled "Next" / ">" that is not disabled
  let nextHref: string | null = null

  $('a').each((_, el) => {
    const text = $(el).text().trim().toLowerCase()
    const href = $(el).attr('href')
    if ((text === 'next' || text === '>' || text.startsWith('next')) && href && href !== '#') {
      const parent = $(el).parent()
      if (!parent.hasClass('disabled') && !$(el).hasClass('disabled')) {
        nextHref = href.startsWith('http') ? href : new URL(href, baseUrl).toString()
      }
    }
  })

  return nextHref
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const cp = await loadCheckpoint()

  if (cp.completedCategories.length > 0) {
    console.error(`Resuming: ${cp.completedCategories.length} categories done, ${cp.records.length} records collected`)
  }

  const session = new Session()

  // Initial GET to establish session & parse the form
  console.error('Fetching form...')
  const formHtml = await session.get(FORM_URL)
  const meta = extractFormMeta(formHtml)

  if (!meta) {
    console.error('Cannot proceed without form metadata.')
    Deno.exit(1)
  }

  if (meta.categoryOptions.length === 0) {
    console.error('No category options found. The page may require JavaScript. Consider using the Puppeteer version.')
    Deno.exit(1)
  }

  const seen = new Set<string>(cp.records.map((r) => r[cp.headers[0]] ?? ''))
  const formAction = meta.action.startsWith('http') ? meta.action : new URL(meta.action, FORM_URL).toString()

  for (let i = 0; i < meta.categoryOptions.length; i++) {
    const cat = meta.categoryOptions[i]

    if (cp.completedCategories.includes(cat.value)) {
      console.error(`[${i + 1}/${meta.categoryOptions.length}] Skipping (done): ${cat.label}`)
      continue
    }

    console.error(`[${i + 1}/${meta.categoryOptions.length}] Category: ${cat.label}`)

    // Build form body
    const body = new URLSearchParams()
    for (const [k, v] of Object.entries(meta.hiddenFields)) body.set(k, v)
    body.set('rn_timestamp', Math.floor(Date.now() / 1000).toString())
    body.set(REGISTER_FIELD_NAME, REGISTER_FIELD_VALUE)
    body.set(CATEGORY_FIELD_NAME, cat.value)
    if (meta.submitName) body.set(meta.submitName, meta.submitValue ?? '')

    let currentUrl = formAction
    let pageNum = 1
    let categoryRecords = 0
    let isFirstPage = true

    while (true) {
      const resultsHtml = isFirstPage
        ? await session.post(formAction, body)
        : await session.get(currentUrl)

      isFirstPage = false

      const { headers, rows } = parseTableRows(resultsHtml, cp.headers)

      if (cp.headers.length === 0 && headers.length > 0) {
        cp.headers = headers
        console.error(`  Headers: ${headers.join(', ')}`)
      }

      if (rows.length === 0) {
        if (pageNum === 1) console.error(`  No results`)
        break
      }

      let newOnPage = 0
      for (const row of rows) {
        const key = row[cp.headers[0]] ?? ''
        if (key && !seen.has(key)) {
          seen.add(key)
          cp.records.push(row)
          newOnPage++
        }
      }
      categoryRecords += newOnPage
      console.error(`  Page ${pageNum}: ${rows.length} rows (${newOnPage} new)`)

      const nextUrl = findNextPage(resultsHtml, currentUrl)
      if (!nextUrl) break

      currentUrl = nextUrl
      pageNum++
      await delay(DELAY_MS)
    }

    console.error(`  Done: ${categoryRecords} new records (total: ${cp.records.length})`)
    cp.completedCategories.push(cat.value)
    await saveCheckpoint(cp)
    await delay(DELAY_MS)
  }

  // Write outputs
  console.error('\nWriting outputs...')
  await Deno.writeTextFile(OUT_JSON, JSON.stringify(cp.records, null, 2))
  console.error(`  JSON: ${OUT_JSON} (${cp.records.length} records)`)

  if (cp.headers.length > 0) {
    await Deno.writeTextFile(OUT_CSV, recordsToCsv(cp.headers, cp.records))
    console.error(`  CSV:  ${OUT_CSV}`)
  }

  try { await Deno.remove(CHECKPOINT) } catch { /* ignore */ }
  console.error(`Done. ${cp.records.length} unique doctor records.`)
}

main()
