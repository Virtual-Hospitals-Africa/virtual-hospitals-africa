import { u, a, B as Button, K as FormRow, aB as TextInput, aF as PageHeader, z } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { j as json } from "./responses-Vcjs2Fhe.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
const $$_tpl_2 = ['Homepage<span aria-hidden="true">  →</span>'];
const $$_tpl_1 = ['<div class="overflow-hidden bg-white py-32"><div class="mx-auto max-w-7xl px-6 lg:flex lg:px-8"><div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8"><div class="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">', '<form method="POST" class="w-full mt-4" enctype="multipart/form-data">', '</form><p class="mt-6 text-xl leading-8 text-gray-600">Your application from organization_name is currently under review by organization_admin_name. You will receive an email once your application has been approved.</p><div class="mt-10 flex">', '</div></div><div class="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents"><div class="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">', "</div></div></div></div></div>"];
const handler$1 = postHandler(z.object({}), (_ctx) => {
  return json({
    message: "ok"
  });
});
async function ApplyPage(ctx) {
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Virtual Hospitals Africa",
    children: a($$_tpl_1, u(PageHeader, {
      className: "h1",
      children: "Application under review"
    }), u(FormRow, {
      children: u(TextInput, {
        name: "Name"
      })
    }), u(Button, {
      href: "/",
      children: a($$_tpl_2)
    }), u("img", {
      src: "https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80",
      alt: "Pending Approval",
      class: "aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover"
    }))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___apply = ApplyPage;
export {
  config,
  css,
  _freshRoute___apply as default,
  handler,
  handlers
};
