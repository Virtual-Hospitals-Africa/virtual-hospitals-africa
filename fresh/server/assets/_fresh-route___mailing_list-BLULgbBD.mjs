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
const $$_tpl_1 = ['Receive updates with<ul class="text-lg list-disc list-inside"><li>progress in South Africa and beyond</li><li>a refreshing perspective on the African digital health landscape</li><li>clinical success stories &amp; technical deep dives</li></ul>'];
async function MailingListPage(ctx) {
  return u(SignupTemplate, {
    url: ctx.url,
    title: "Mailing List | Virtual Hospitals Africa",
    h1: "Sign up for our mailing list",
    entrypoint: "mailing_list_signup",
    rationale: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___mailing_list = MailingListPage;
export {
  config,
  css,
  _freshRoute___mailing_list as default,
  handler,
  handlers
};
