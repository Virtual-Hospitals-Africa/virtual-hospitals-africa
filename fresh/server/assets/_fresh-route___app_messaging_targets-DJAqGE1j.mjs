import { j as jsonSearchHandler } from "./jsonSearchHandler-Bfi3q4C9.mjs";
import { v as assertOr400, e8 as isKeyOf } from "../server-entry.mjs";
import { M as MESSAGE_TARGET_CATEGORIES, m as message_targets } from "./message_targets-Bq9oC8ah.mjs";
import "./responses-Vcjs2Fhe.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./pluralize-HYG0Q538.mjs";
const handler$1 = jsonSearchHandler({
  async search(trx, {
    message_target_category,
    search
  }) {
    assertOr400(isKeyOf(message_target_category, MESSAGE_TARGET_CATEGORIES));
    const results = await message_targets.searchTargetCategory(trx, message_target_category, {
      search
    });
    return {
      results,
      page: 1,
      rows_per_page: 20,
      has_next_page: false,
      search_terms: {
        message_target_category,
        search
      }
    };
  }
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_messaging_targets = void 0;
export {
  config,
  css,
  _freshRoute___app_messaging_targets as default,
  handler,
  handlers
};
