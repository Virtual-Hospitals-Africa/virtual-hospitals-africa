import { S as assertEquals, al as SERVER_COUNTRY, m as assert } from "../server-entry.mjs";
import { a as getAddressSuggestions } from "./google-maps-CUZxBdxq.mjs";
import { j as json } from "./responses-Vcjs2Fhe.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./addresses-DYgdsFAd.mjs";
const handler$1 = {
  async GET(ctx) {
    assertEquals(ctx.req.headers.get("accept"), "application/json");
    const url = ctx.url;
    const search_query = url.searchParams.get("search");
    const country = url.searchParams.get("country") || SERVER_COUNTRY;
    const {
      location
    } = ctx.state.organization;
    assert(location, "Only supporting organizations with a location");
    if (!search_query) {
      return json({
        results: [],
        total: 0,
        page: 1,
        has_next_page: false
      });
    }
    if (search_query !== null) {
      const suggestions = await getAddressSuggestions(search_query, {
        location,
        radius: location ? 5e4 : void 0,
        country
      });
      const results = suggestions.map((s) => ({
        id: s.place_id,
        name: s.description,
        label: s.description,
        main_text: s.structured_formatting.main_text,
        secondary_text: s.structured_formatting.secondary_text
      }));
      console.log("Address search results:", results);
      return json({
        results,
        total: results.length,
        page: 1,
        has_next_page: false
      });
    }
    return json({
      results: [],
      total: 0,
      page: 1,
      has_next_page: false
    });
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_google_maps_responses = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_google_maps_responses as default,
  handler,
  handlers
};
