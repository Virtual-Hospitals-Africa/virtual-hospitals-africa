import { a, u, bq as Badge } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="flex flex-col gap-2">WOAH', "", "", "", "</div>"];
function ThankYouPage(_props) {
  return a($$_tpl_1, u(Badge, {
    content: "hello",
    color: "blue"
  }), u(Badge, {
    content: "hello",
    color: "red"
  }), u(Badge, {
    content: "hello",
    color: "yellow"
  }), u(Badge, {
    content: "virtualhealthafrica",
    color: "purple"
  }));
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___playground = ThankYouPage;
export {
  config,
  css,
  _freshRoute___playground as default,
  handler,
  handlers
};
