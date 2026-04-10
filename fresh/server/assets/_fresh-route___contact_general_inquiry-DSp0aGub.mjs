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
const $$_tpl_1 = ['We&#39;d love to hear from you — whether you&#39;re curious about<ul class="text-lg list-disc list-inside"><li>how the platform works or could work for you</li><li>partnering with us in any capacity</li><li>anything else on your mind</li></ul>'];
function GeneralInquiryPage({
  url
}) {
  return u(SignupTemplate, {
    url,
    title: "Contact Us | Virtual Hospitals Africa",
    h1: "Get in touch",
    entrypoint: "general_inquiry",
    rationale: a($$_tpl_1)
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___contact_general_inquiry = GeneralInquiryPage;
export {
  config,
  css,
  _freshRoute___contact_general_inquiry as default,
  handler,
  handlers
};
