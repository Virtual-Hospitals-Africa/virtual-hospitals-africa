import db from '../../db/db.ts'
import type { Handlers } from 'fresh/compat'
import type { SnomedCategory } from '../../db.d.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

const MCP_VERSION = '2024-11-05'

type JsonRpcRequest = {
  jsonrpc: '2.0'
  id?: number | string | null
  method: string
  params?: Record<string, unknown>
}

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: number | string | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

type SnomedResult = {
  snomed_concept_id: string
  name: string
  category: SnomedCategory
}

async function searchSnomed(
  query: string,
  limit = 20,
): Promise<SnomedResult[]> {
  const results = await db
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .select(['id', 'name', 'category'])
    .where('name', 'ilike', `%${query}%`)
    .orderBy('name', 'asc')
    .limit(limit)
    .execute()

  return results.map((row) => ({
    snomed_concept_id: String(row.id),
    name: row.name,
    category: row.category,
  }))
}

function createResponse(
  id: number | string | null,
  result: unknown,
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  }
}

function createErrorResponse(
  id: number | string | null,
  code: number,
  message: string,
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message },
  }
}

async function handleRequest(
  request: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  const { id, method, params } = request
  const request_id = id ?? null

  // Notifications (methods starting with notifications/) don't expect a response
  if (method.startsWith('notifications/')) {
    return null
  }

  switch (method) {
    case 'initialize':
      return createResponse(request_id, {
        protocolVersion: MCP_VERSION,
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'vha-snomed-server',
          version: '1.0.0',
        },
      })

    case 'ping':
      return createResponse(request_id, {})

    case 'tools/list':
      return createResponse(request_id, {
        tools: [
          {
            name: 'search_snomed',
            description:
              'Search for SNOMED CT concepts by name. Returns snomed_concept_id, name, and category for matching concepts.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description:
                    'The search query to match against SNOMED concept names',
                },
                limit: {
                  type: 'number',
                  description:
                    'Maximum number of results to return (default: 20)',
                },
              },
              required: ['query'],
            },
          },
        ],
      })

    case 'tools/call': {
      const tool_name = params?.name as string
      const tool_args = params?.arguments as Record<string, unknown> | undefined

      if (tool_name === 'search_snomed') {
        const query = tool_args?.query as string
        if (!query) {
          return createErrorResponse(
            request_id,
            -32602,
            'Missing required parameter: query',
          )
        }
        const limit = (tool_args?.limit as number) || 20
        const results = await searchSnomed(query, limit)
        return createResponse(request_id, {
          content: [
            {
              type: 'text',
              text: humanReadableJson(results),
            },
          ],
        })
      }

      return createErrorResponse(
        request_id,
        -32601,
        `Unknown tool: ${tool_name}`,
      )
    }

    default:
      return createErrorResponse(
        request_id,
        -32601,
        `Method not found: ${method}`,
      )
  }
}

export const handler: Handlers = {
  async POST(ctx) {
    const body: JsonRpcRequest = await ctx.req.json()
    const response = await handleRequest(body)

    // Notifications don't expect a response
    if (response === null) {
      return new Response(null, { status: 204 })
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    })
  },

  GET(_ctx) {
    return new Response(
      JSON.stringify({
        name: 'vha-snomed-server',
        version: '1.0.0',
        description:
          'MCP server for searching SNOMED CT concepts from VHA database',
        mcpVersion: MCP_VERSION,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
}
