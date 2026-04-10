import { aA as humanReadableJson, d as db, bN as asText, aI as sql } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const MCP_VERSION = "2024-11-05";
function searchSnomed(query, limit = 20) {
  return db.selectFrom("snomed_inferred_canonical_name_and_category").innerJoin("snomed_description", "snomed_inferred_canonical_name_and_category.id", "snomed_description.concept_id").select((eb) => [asText(eb, "snomed_inferred_canonical_name_and_category.id").as("id"), "snomed_inferred_canonical_name_and_category.name", "snomed_inferred_canonical_name_and_category.category"]).where(sql`term % ${query}`).groupBy("snomed_inferred_canonical_name_and_category.id").orderBy(sql`max(similarity(term, ${query}))`, "desc").limit(limit).execute();
}
function createResponse(id, result) {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}
function createErrorResponse(id, code, message) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message
    }
  };
}
async function handleRequest(request) {
  const {
    id,
    method,
    params
  } = request;
  const request_id = id ?? null;
  if (method.startsWith("notifications/")) {
    return null;
  }
  switch (method) {
    case "initialize":
      return createResponse(request_id, {
        protocolVersion: MCP_VERSION,
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "vha-snomed-server",
          version: "1.0.0"
        }
      });
    case "ping":
      return createResponse(request_id, {});
    case "tools/list":
      return createResponse(request_id, {
        tools: [{
          name: "search_snomed",
          description: "Search for SNOMED CT concepts by name. Returns id, name, and category for matching concepts.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to match against SNOMED concept names"
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return (default: 20)"
              }
            },
            required: ["query"]
          }
        }]
      });
    case "tools/call": {
      const tool_name = params?.name;
      const tool_args = params?.arguments;
      if (tool_name === "search_snomed") {
        const query = tool_args?.query;
        if (!query) {
          return createErrorResponse(request_id, -32602, "Missing required parameter: query");
        }
        const limit = tool_args?.limit || 20;
        const results = await searchSnomed(query, limit);
        return createResponse(request_id, {
          content: [{
            type: "text",
            text: humanReadableJson(results)
          }]
        });
      }
      return createErrorResponse(request_id, -32601, `Unknown tool: ${tool_name}`);
    }
    default:
      return createErrorResponse(request_id, -32601, `Method not found: ${method}`);
  }
}
const handler$1 = {
  async POST(ctx) {
    const body = await ctx.req.json();
    const response = await handleRequest(body);
    if (response === null) {
      return new Response(null, {
        status: 204
      });
    }
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  },
  GET(_ctx) {
    return new Response(JSON.stringify({
      name: "vha-snomed-server",
      version: "1.0.0",
      description: "MCP server for searching SNOMED CT concepts from VHA database",
      mcpVersion: MCP_VERSION
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___mcp_snomed = void 0;
export {
  config,
  css,
  _freshRoute___mcp_snomed as default,
  handler,
  handlers
};
