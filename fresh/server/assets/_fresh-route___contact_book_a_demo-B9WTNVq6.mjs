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
const $$_tpl_1 = ['See Virtual Hospitals Africa in action — a live walkthrough of<ul class="text-lg list-disc list-inside"><li>the WhatsApp patient triage and consultation flow</li><li>the web app your health workers use day-to-day</li><li>how clinical data is captured, stored, and acted on</li></ul>'];
function BookADemoPage({
  url
}) {
  return u(SignupTemplate, {
    url,
    title: "Book a Demo | Virtual Hospitals Africa",
    h1: "Book a demo",
    entrypoint: "book_a_demo",
    rationale: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___contact_book_a_demo = BookADemoPage;
export {
  config,
  css,
  _freshRoute___contact_book_a_demo as default,
  handler,
  handlers
};
