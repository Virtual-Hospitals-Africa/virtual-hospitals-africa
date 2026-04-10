import { u, a, b as s } from "../server-entry.mjs";
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
const $$_tpl_1 = ['<div class="flex flex-col items-center justify-center gap-8 py-12 text-center max-w-lg mx-auto">', '<div class="flex flex-col gap-3"><h1 class="text-3xl font-bold text-gray-900">Thank You</h1>', "</div></div>"];
const $$_tpl_2 = ['<p class="text-lg text-gray-600">', "</p>"];
async function ThankYouPage(ctx) {
  const message = ctx.url.searchParams.get("message");
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Virtual Hospitals Africa",
    children: a($$_tpl_1, u("img", {
      src: "/images/gratitude.jpg",
      alt: "Hands held together in gratitude",
      class: "rounded-2xl shadow-lg w-full max-w-sm object-cover"
    }), s(message && a($$_tpl_2, s(message))))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___thank_you = ThankYouPage;
export {
  config,
  css,
  _freshRoute___thank_you as default,
  handler,
  handlers
};
