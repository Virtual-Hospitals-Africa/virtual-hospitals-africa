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
const $$_tpl_1 = ['Let&#39;s get to know each other — a short, no-pressure conversation about<ul class="text-lg list-disc list-inside"><li>where you&#39;re coming from and what you&#39;re working on</li><li>where Virtual Hospitals Africa is headed</li><li>whether there&#39;s a fit worth exploring further</li></ul>'];
function BookAnIntroCallPage({
  url
}) {
  return u(SignupTemplate, {
    url,
    title: "Book an Intro Call | Virtual Hospitals Africa",
    h1: "Book an intro call",
    entrypoint: "book_an_intro_call",
    rationale: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___contact_book_an_intro_call = BookAnIntroCallPage;
export {
  config,
  css,
  _freshRoute___contact_book_an_intro_call as default,
  handler,
  handlers
};
