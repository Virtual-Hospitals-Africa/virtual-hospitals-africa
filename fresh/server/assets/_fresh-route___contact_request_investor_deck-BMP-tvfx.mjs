import { u, a } from "../server-entry.mjs";
import { S as SignupTemplate } from "./SignupTemplate-BdXlagQp.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./JustLogoLayout-CBo8Mo4Y.mjs";
import "./Footer-CjAnK5R7.mjs";
import "./SideBySide-C6xl9IQw.mjs";
const $$_tpl_1 = ['Get the full picture on Virtual Hospitals Africa, including<ul class="text-lg list-disc list-inside"><li>the problem we&#39;re solving and why now</li><li>our clinical model, traction, and roadmap</li><li>the opportunity across Sub-Saharan Africa</li></ul>'];
function RequestInvestorDeckPage({
  url
}) {
  return u(SignupTemplate, {
    url,
    title: "Request Investor Deck | Virtual Hospitals Africa",
    h1: "Request our investor deck",
    entrypoint: "request_investor_deck",
    rationale: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___contact_request_investor_deck = RequestInvestorDeckPage;
export {
  config,
  css,
  _freshRoute___contact_request_investor_deck as default,
  handler,
  handlers
};
