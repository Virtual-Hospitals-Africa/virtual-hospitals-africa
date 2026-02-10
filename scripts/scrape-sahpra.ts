#!/usr/bin/env -S deno run --allow-net

const BASE_URL = 'https://medapps.sahpra.org.za:6006/Home/getData'
const PAGE_SIZE = 100

function buildRequestBody(draw: number, start: number): string {
  const params = new URLSearchParams()

  params.set('draw', draw.toString())

  // Column definitions
  const columns = [
    { data: 'applicantName', name: 'applicantName' },
    { data: 'productName', name: 'productName' },
    { data: 'api', name: 'api' },
    { data: 'licence_no', name: 'licence_no' },
    { data: 'application_no', name: 'application_no' },
    { data: 'reg_date', name: 'reg_date' },
    { data: 'status', name: 'status' },
    { data: 'secureId', name: '' },
  ]

  columns.forEach((col, i) => {
    params.set(`columns[${i}][data]`, col.data)
    params.set(`columns[${i}][name]`, col.name)
    params.set(`columns[${i}][searchable]`, 'true')
    params.set(`columns[${i}][orderable]`, 'true')
    params.set(`columns[${i}][search][value]`, '')
    params.set(`columns[${i}][search][regex]`, 'false')
  })

  // Ordering
  params.set('order[0][column]', '0')
  params.set('order[0][dir]', 'asc')

  // Pagination
  params.set('start', start.toString())
  params.set('length', PAGE_SIZE.toString())

  // Search
  params.set('search[value]', '')
  params.set('search[regex]', 'false')

  return params.toString()
}

interface SahpraRecord {
  secureId: string
  applicantName: string
  appSecureId: string
  application_no: string
  licence_no: string
  productName: string
  status: string
  expiryDate: string
  reg_date: string
  ingredient: string
  therapeutic_area: string | null
  api: string
}

interface SahpraResponse {
  data: SahpraRecord[]
  draw: string
  recordsTotal: number
  recordsFiltered: number
}

async function fetchPage(draw: number, start: number): Promise<SahpraResponse> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: buildRequestBody(draw, start),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

async function main() {
  let draw = 1
  let start = 0
  let total_records = 0
  let fetched_count = 0

  // First request to get total count
  const first_page = await fetchPage(draw, start)
  total_records = first_page.recordsFiltered

  console.error(`Total records to fetch: ${total_records}`)

  // Output first page records
  for (const record of first_page.data) {
    console.log(JSON.stringify(record))
  }
  fetched_count += first_page.data.length

  // Continue fetching remaining pages
  while (fetched_count < total_records) {
    draw++
    start += PAGE_SIZE

    console.error(`Fetching page ${draw} (start: ${start}, fetched: ${fetched_count}/${total_records})`)

    const page = await fetchPage(draw, start)

    if (page.data.length === 0) {
      console.error('No more results, stopping.')
      break
    }

    for (const record of page.data) {
      console.log(JSON.stringify(record))
    }
    fetched_count += page.data.length

    // Small delay to be polite to the server
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.error(`Done. Fetched ${fetched_count} records.`)
}

main()
