#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --allow-run --allow-sys

// Scrapes all Medical Practitioner records from the HPCSA iRegister by iterating
// every category option, paginating through results, and exporting JSON + CSV.
// Phase 2 visits each doctor's detail page and merges the Category details table data.
//
// Usage:
//   deno task scrape:hpcsa-doctors                    — full run (all categories, headless)
//   LIMIT=10 deno task scrape:hpcsa-doctors           — first 10 categories only (for testing)
//   START=2 LIMIT=1 deno task scrape:hpcsa-doctors    — skip first 2 categories, run 1 (for testing)
//   HEADED=1 deno task scrape:hpcsa-doctors           — visible browser (for debugging selectors)
//   LIMIT=10 HEADED=1 deno task scrape:hpcsa-doctors  — both combined
//
// Outputs: db/resources/hpcsa_doctors_<date>.json and .csv
// Resumes automatically from checkpoint if interrupted (both Phase 1 and Phase 2).

import puppeteer from 'puppeteer'

const DATE_STAMP = new Date().toISOString().slice(0, 10)
const OUT_JSON = `db/resources/hpcsa_doctors_${DATE_STAMP}.json`
const OUT_CSV = `db/resources/hpcsa_doctors_${DATE_STAMP}.csv`
const CHECKPOINT = `db/resources/hpcsa_doctors_${DATE_STAMP}.checkpoint.json`

const FORM_URL = 'https://hpcsaonline.custhelp.com/app/i_reg_form'
// Registration number (with spaces) is URL-encoded and appended directly.
// If detail pages return 404 or wrong content, re-inspect the URL pattern from the View link in the search results table.
const DETAIL_BASE_URL = 'https://hpcsaonline.custhelp.com/app/iregister_details/reg_number/'
const DELAY_MS = 300

// Date columns on the detail page — values will be normalized to YYYY-MM-DD for database import
const DATE_COLUMNS = new Set(['from date', 'end date', 'registration date', 'expiry date'])

// From network payload inspection: both <select> elements have no name attribute —
// field names ("register", "category") and values are set by page JS at submission.
// The register select id contains "register", category select id contains "category".
// If selectors stop working, re-inspect the Network tab payload for changes.
const REGISTER_VALUE = 'Medical Practitioner'

interface DoctorRecord {
  [column: string]: string
}

interface Checkpoint {
  completedCategories: string[]
  records: DoctorRecord[]
  headers: string[]
  detailScrapedRegistrations: string[]  // Phase 2: tracks which doctors' detail pages have been visited
  detailHeaders: string[]               // Phase 2: column names from the Category details table
}

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
    const text = await Deno.readTextFile(CHECKPOINT)
    const cp = JSON.parse(text) as Checkpoint
    cp.detailScrapedRegistrations ??= []
    cp.detailHeaders ??= []
    return cp
  } catch {
    return { completedCategories: [], records: [], headers: [], detailScrapedRegistrations: [], detailHeaders: [] }
  }
}

async function saveCheckpoint(cp: Checkpoint): Promise<void> {
  await Deno.writeTextFile(CHECKPOINT, JSON.stringify(cp))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

// Normalizes SA date strings to YYYY-MM-DD for database compatibility.
// Handles DD/MM/YYYY, DD Mon YYYY, and passes through already-ISO values.
function normalizeDate(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`
  const text = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (text) {
    const month = MONTH_MAP[text[2].toLowerCase()]
    if (month) return `${text[3]}-${month}-${text[1].padStart(2, '0')}`
  }
  return s
}

async function main() {
  const headed = Deno.env.get('HEADED') === '1'
  const limit = parseInt(Deno.env.get('LIMIT') ?? '0')
  const start = parseInt(Deno.env.get('START') ?? '0')
  const checkpoint = await loadCheckpoint()

  if (checkpoint.completedCategories.length > 0) {
    console.log(`Resuming from checkpoint — ${checkpoint.completedCategories.length} categories already done, ${checkpoint.records.length} records collected`)
  }

  const browser = await puppeteer.launch({ headless: !headed })
  const page = await browser.newPage()

  await page.goto(FORM_URL, { waitUntil: 'networkidle2', timeout: 60_000 })
  console.log('Page loaded')

  // Read all category options
  const categories = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'))
    const categorySelect = selects.find((s) => {
      const id = (s.id + s.name).toLowerCase()
      return id.includes('categ')
    })

    if (!categorySelect) return []
    return Array.from(categorySelect.options)
      .filter((o) => o.value && o.value.trim() !== '')
      .map((o) => ({ value: o.value, label: o.text.trim() }))
  })

  console.log(`Found ${categories.length} categories`)

  if (categories.length === 0) {
    console.error('ERROR: No categories found. The page structure may have changed. Run with HEADED=1 to inspect.')
    await browser.close()
    Deno.exit(1)
  }

  const seen = new Set<string>(checkpoint.records.map((r) => r['Registration']))

  const categoriesToRun = categories.slice(start, limit > 0 ? start + limit : undefined)
  if (start > 0 || limit > 0) console.log(`Running categories [${start}–${start + categoriesToRun.length - 1}] (START=${start}, LIMIT=${limit || 'all'})`)

  // Iterate each category, submit a search, and scrape all paginated results
  for (let i = 0; i < categoriesToRun.length; i++) {
    const cat = categoriesToRun[i]

    if (checkpoint.completedCategories.includes(cat.value)) {
      console.log(`[${i + 1}/${categories.length}] Skipping (checkpointed): ${cat.label}`)
      continue
    }

    console.log(`[${i + 1}/${categories.length}] Searching category: ${cat.label}`)

    // Navigate fresh to the form each iteration to reset state reliably
    await page.goto(FORM_URL, { waitUntil: 'networkidle2', timeout: 60_000 })

    // Set Register dropdown to "Medical Practitioner"
    const registerSet = await page.evaluate((registerValue: string) => {
      const selects = Array.from(document.querySelectorAll('select'))
      const registerSelect = selects.find((s) => {
        const id = (s.id + s.name).toLowerCase()
        return id.includes('reg')
      })
      if (!registerSelect) return false
      const option = Array.from(registerSelect.options).find(
        (o) => o.text.toLowerCase().includes(registerValue.toLowerCase()),
      )
      if (!option) return false
      registerSelect.value = option.value
      registerSelect.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }, REGISTER_VALUE)

    if (!registerSet) {
      console.error(`  WARNING: Could not find Register dropdown — skipping category "${cat.label}"`)
      checkpoint.completedCategories.push(cat.value)
      await saveCheckpoint(checkpoint)
      continue
    }

    // Set Category dropdown
    const categorySet = await page.evaluate((catValue: string) => {
      const selects = Array.from(document.querySelectorAll('select'))
      const categorySelect = selects.find((s) => {
        const id = (s.id + s.name).toLowerCase()
        return id.includes('categ')
      })
      if (!categorySelect) return false
      categorySelect.value = catValue
      categorySelect.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }, cat.value)

    if (!categorySet) {
      console.error(`  WARNING: Could not set category dropdown — skipping "${cat.label}"`)
      checkpoint.completedCategories.push(cat.value)
      await saveCheckpoint(checkpoint)
      continue
    }

    // Click the search button — run with HEADED=1 to confirm the exact selector
    const searchClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('input, button, a')).find((el) => {
        const text = (el.textContent ?? (el as HTMLInputElement).value ?? '').toLowerCase()
        return text.includes('search') || text.includes('iregister')
      }) as HTMLElement | undefined
      if (!btn) return false
      btn.click()
      return true
    })

    if (!searchClicked) {
      console.error(`  WARNING: Could not find search button — skipping category "${cat.label}"`)
      checkpoint.completedCategories.push(cat.value)
      await saveCheckpoint(checkpoint)
      continue
    }

    // Wait for results or "no results" indicator
    try {
      await page.waitForSelector('table tbody tr, .no-results, [class*="no-result"], [class*="empty"]', {
        timeout: 30_000,
      })
    } catch {
      console.log(`  No results or timeout for category: ${cat.label}`)
      checkpoint.completedCategories.push(cat.value)
      await saveCheckpoint(checkpoint)
      continue
    }

    // Check if it's a "no results" state — excludes the "No data to display" message row
    const hasResults = await page.evaluate(() => {
      return document.querySelectorAll('table tbody:not(.yui3-datatable-message) tr').length > 0
    })

    if (!hasResults) {
      console.log(`  No data to display for category: ${cat.label}`)
      checkpoint.completedCategories.push(cat.value)
      await saveCheckpoint(checkpoint)
      await delay(DELAY_MS)
      continue
    }

    // Read headers once
    if (checkpoint.headers.length === 0) {
      checkpoint.headers = await page.evaluate(() => {
        const ths = Array.from(document.querySelectorAll('table thead th'))
        return ths.map((th) => th.textContent?.trim() ?? '')
      })
      console.log(`  Table headers: ${checkpoint.headers.join(', ')}`)
    }

    let pageNum = 1
    let categoryRecords = 0
    let prevFirstKey = ''
    let consecutiveEmptyPages = 0

    // Each row has a "View" link column (empty header — dropped by the if (h) guard).
    // Phase 2 visits each doctor's detail page via URL constructed from the Registration number.

    // Scrape all pages — rows is one page's worth of records, loop accumulates across all pages
    while (true) {
      const rows = await page.evaluate((headers: string[]) => {
        const trs = Array.from(document.querySelectorAll('table tbody tr'))
        return trs.map((tr) => {
          const cells = Array.from(tr.querySelectorAll('td'))
          const record: Record<string, string> = {}
          headers.forEach((h, idx) => {
            if (!h) return
            const raw = cells[idx]?.textContent?.trim() ?? ''
            // Preserve original spacing in Registration — it's used verbatim in the detail page URL
            record[h] = h === 'Registration' ? raw : raw.replace(/\s+/g, ' ')
          })
          return record
        })
      }, checkpoint.headers)

      // Detect cycling — if first row matches previous page's first row, we've looped back
      const firstKey = rows[0]?.[checkpoint.headers[0]] ?? ''
      if (firstKey && firstKey === prevFirstKey) {
        console.log(`  Detected page cycle at page ${pageNum}, stopping pagination`)
        break
      }
      prevFirstKey = firstKey

      let newOnPage = 0
      for (const row of rows) {
        const key = row['Registration']
        if (key && !seen.has(key)) {
          seen.add(key)
          checkpoint.records.push(row)
          newOnPage++
        }
      }

      categoryRecords += newOnPage
      console.log(`  Page ${pageNum}: ${rows.length} rows (${newOnPage} new)`)

      if (newOnPage === 0) consecutiveEmptyPages++
      else consecutiveEmptyPages = 0
      if (consecutiveEmptyPages >= 3) {
        console.log(`  3 consecutive pages with 0 new records, stopping pagination`)
        break
      }

      // Check for and click Next button
      const hasNext = await page.evaluate(() => {
        const next = Array.from(document.querySelectorAll('a, button')).find((el) =>
          (el.textContent ?? '').trim().toLowerCase().includes('next')
        ) as HTMLElement | undefined
        if (!next || next.hasAttribute('disabled') || next.classList.contains('disabled')) return false
        next.click()
        return true
      })

      if (!hasNext) break

      pageNum++
      try {
        await page.waitForNetworkIdle({ timeout: 15_000 })
      } catch {
        await delay(500)
      }
    }

    console.log(`  Category "${cat.label}" done: ${categoryRecords} new records (total: ${checkpoint.records.length})`)
    checkpoint.completedCategories.push(cat.value)
    await saveCheckpoint(checkpoint)
    await delay(DELAY_MS)
  }

  await browser.close()

  // Phase 2: visit each doctor's detail page and merge Category details table data
  const detailDone = new Set(checkpoint.detailScrapedRegistrations)
  const toDetail = checkpoint.records.filter((r) => !detailDone.has(r['Registration']))

  if (toDetail.length > 0) {
    console.log(`\nPhase 2: scraping detail pages for ${toDetail.length} doctors...`)

    const browser2 = await puppeteer.launch({ headless: !headed })
    const page2 = await browser2.newPage()

    for (let i = 0; i < toDetail.length; i++) {
      const record = toDetail[i]
      const reg = record['Registration']
      const url = `${DETAIL_BASE_URL}${encodeURIComponent(reg)}`

      console.log(`  [${i + 1}/${toDetail.length}] Detail: ${reg}`)

      try {
        await page2.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 })

        // Wait for the Category Details section to render.
        // If the label or URL pattern changes, inspect the detail page with HEADED=1.
        try {
          await page2.waitForSelector('label[for="CategoryDetails"]', { timeout: 15_000 })
        } catch {
          console.error(`  WARNING: Category details section not found for ${reg} — run with HEADED=1 to inspect`)
        }

        const detailData = await page2.evaluate(() => {
          // Locate the Category Details table via its label — there are multiple tables on the page.
          // The label sits inside <div class="form-group"> which is a child of <div class="category">;
          // the table is a sibling of that form-group, so we climb to .category to find it.
          const label = document.querySelector('label[for="CategoryDetails"]')
          const section = label?.closest('.category') ?? label?.closest('div')?.parentElement
          const table = section?.querySelector('table')
          if (!table) return null

          // The table has no <thead> — first <tr> in <tbody> holds header <td> cells, rest are data rows
          const allRows = Array.from(table.querySelectorAll('tbody tr'))
          if (allRows.length < 2) return null

          const headers = Array.from(allRows[0].querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '')
          const dataRows = allRows.slice(1)

          const statusIdx = headers.findIndex((h) => h.toUpperCase() === 'STATUS')

          // Prefer last ACTIVE row; fall back to last row if none are active
          let targetRow = dataRows[dataRows.length - 1]
          if (statusIdx >= 0) {
            const activeRow = [...dataRows].reverse().find((tr) =>
              tr.querySelectorAll('td')[statusIdx]?.textContent?.trim().toUpperCase() === 'ACTIVE'
            )
            if (activeRow) targetRow = activeRow
          }

          const cells = Array.from(targetRow.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '')
          return { headers, cells }
        })

        if (!detailData) console.error(`  WARNING: Could not parse Category details table for ${reg}`)

        if (detailData) {
          // Discover and register detail headers on the first successful page
          if (checkpoint.detailHeaders.length === 0) {
            checkpoint.detailHeaders = detailData.headers.filter((h) => h && h.toLowerCase() !== 'status')
            checkpoint.headers.push(...checkpoint.detailHeaders)
            console.log(`  Detail headers: ${checkpoint.detailHeaders.join(', ')}`)
          }

          // Merge detail columns into the record — toDetail holds references into checkpoint.records
          detailData.headers.forEach((h, idx) => {
            if (!h || h.toLowerCase() === 'status') return
            const raw = (detailData.cells[idx] ?? '').replace(/\s+/g, ' ')
            record[h] = DATE_COLUMNS.has(h.toLowerCase()) ? normalizeDate(raw) : raw
          })
        }
      } catch (err) {
        console.error(`  ERROR for ${reg}: ${err}`)
      }

      checkpoint.detailScrapedRegistrations.push(reg)
      detailDone.add(reg)
      await saveCheckpoint(checkpoint)
      await delay(DELAY_MS)
    }

    await browser2.close()
    console.log(`Phase 2 complete. ${checkpoint.detailScrapedRegistrations.length} detail pages scraped.`)
  } else {
    console.log('\nPhase 2: all detail pages already scraped, skipping.')
  }

  // Normalize Registration spacing now that Phase 2 URL construction is done
  for (const record of checkpoint.records) {
    if (record['Registration']) record['Registration'] = record['Registration'].replace(/\s+/g, ' ')
  }

  console.log('\nWriting outputs...')
  await Deno.writeTextFile(OUT_JSON, JSON.stringify(checkpoint.records, null, 2))
  console.log(`  JSON: ${OUT_JSON} (${checkpoint.records.length} records)`)

  if (checkpoint.headers.length > 0) {
    await Deno.writeTextFile(OUT_CSV, recordsToCsv(checkpoint.headers, checkpoint.records))
    console.log(`  CSV:  ${OUT_CSV}`)
  } else {
    console.error('WARNING: No headers found, skipping CSV output')
  }

  try {
    await Deno.remove(CHECKPOINT)
  } catch {
    // ignore
  }

  console.log(`Done. ${checkpoint.records.length} unique doctor records exported.`)
}

main()
