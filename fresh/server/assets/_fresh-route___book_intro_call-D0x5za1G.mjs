import { u, a } from "../server-entry.mjs";
import { C as ContactPage } from "./ContactPage-rX4lWm5G.mjs";
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
const $$_tpl_1 = ['<p class="text-xl leading-8 text-gray-600"><i>TK. Book an intro call</i></p>'];
function BookIntroCallPage(props) {
  return u(ContactPage, {
    url: props.url,
    title: "Book an intro call",
    message: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___book_intro_call = BookIntroCallPage;
export {
  config,
  css,
  _freshRoute___book_intro_call as default,
  handler,
  handlers
};
