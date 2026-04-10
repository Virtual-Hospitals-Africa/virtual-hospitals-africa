import { a, u, dW as ICD10SearchSpecific } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="p-4">', "</div>"];
async function ICD10SearchPage(_ctx) {
  return a($$_tpl_1, u(ICD10SearchSpecific, {
    name: "",
    label: "ICD10",
    href: "/clinical_decision_support_tools/icd10",
    className: "w-full"
  }));
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_icd10_search = ICD10SearchPage;
export {
  config,
  css,
  _freshRoute___app_icd10_search as default,
  handler,
  handlers
};
