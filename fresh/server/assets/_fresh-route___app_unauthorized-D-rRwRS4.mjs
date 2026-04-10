import { u, a, B as Button, aF as PageHeader } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
const $$_tpl_1 = ['<main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8"><div class="text-center">', '<p class="mt-6 text-xl leading-8 text-gray-600">Sorry, we can&#39;t find an account with that email address. Please contact your administrator. Perhaps another account is registered, in which case you can try again</p><div class="mt-10 flex items-center justify-center gap-x-6">', "</div></div></main>"];
async function UnauthorizedPage(ctx) {
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Virtual Hospitals Africa",
    children: a($$_tpl_1, u(PageHeader, {
      className: "h1",
      children: "Unauthorized"
    }), u(Button, {
      href: "/login",
      children: "Sign In"
    }))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_unauthorized = UnauthorizedPage;
export {
  config,
  css,
  _freshRoute___app_unauthorized as default,
  handler,
  handlers
};
