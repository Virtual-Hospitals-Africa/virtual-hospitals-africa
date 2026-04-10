import { u, a } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { S as SideBySide } from "./SideBySide-C6xl9IQw.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
const $$_tpl_1 = ['<p class="mt-2 max-w-4xl text-sm text-gray-500">Virtual Hospitals Africa is exicted to off</p>'];
async function VolunteerPage(ctx) {
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Volunteer Opportunities | Virtual Hospitals Africa",
    children: u(SideBySide, {
      image: "https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80",
      h1: "Volunteer Opportunities",
      children: a($$_tpl_1)
    })
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___volunteer = VolunteerPage;
export {
  config,
  css,
  _freshRoute___volunteer as default,
  handler,
  handlers
};
