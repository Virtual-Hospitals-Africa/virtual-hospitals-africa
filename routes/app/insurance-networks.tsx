import { insurance_network } from '../../db/models/insurance_network.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

// Create base handler using jsonSearchHandler
const base_handler = jsonSearchHandler(insurance_network)

export const handler = {
  async GET(ctx: Parameters<typeof base_handler.GET>[0]) {
    // Get response from base handler
    const response = await base_handler.GET(ctx)

    // Clone response and transform the JSON
    const text = await response.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return response
    }

    // Transform business_name to name for Search component compatibility
    if (Array.isArray(data)) {
      data = data.map((insurance: Record<string, unknown>) => ({
        ...insurance,
        name: insurance.business_name,
      }))
    } else if (typeof data === 'object' && data !== null && 'results' in data) {
      const obj = data as Record<string, unknown>
      obj.results = (obj.results as Record<string, unknown>[]).map((insurance) => ({
        ...insurance,
        name: insurance.business_name,
      }))
    }

    // Return transformed response
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-type': 'application/json',
      },
    })
  },
}

