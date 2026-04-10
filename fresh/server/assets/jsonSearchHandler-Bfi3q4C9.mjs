import { j as json } from "./responses-Vcjs2Fhe.mjs";
function jsonSearchHandler(model, default_search_terms, opts) {
  return {
    GET(ctx) {
      if (opts?.verbose) {
        console.log("Searching", {
          url: ctx.url,
          state: ctx.state
        });
      }
      const accepts_json = ctx.req.headers.get("accept") === "application/json";
      const response = accepts_json ? json : json.humanReadable;
      let page = 1;
      const search_terms = typeof default_search_terms === "function" ? default_search_terms(ctx) : default_search_terms || {};
      ctx.url.searchParams.forEach((value, key) => {
        if (key in search_terms && typeof default_search_terms === "function") {
          return;
        }
        if (key === "page") {
          page = parseInt(value) || 1;
        } else if (value === "true" || value === "false") {
          search_terms[key] = value === "true";
        } else if (value.startsWith("[")) {
          search_terms[key] = value.slice(1, -1).split(",");
        } else {
          search_terms[key] = value;
        }
      });
      return model.search(ctx.state.trx, search_terms, {
        ...opts,
        page
      }).then(response);
    }
  };
}
export {
  jsonSearchHandler as j
};
