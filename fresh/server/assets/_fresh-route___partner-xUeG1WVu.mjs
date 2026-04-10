import { u, a, av as Form, K as FormRow, aB as TextInput, aC as SelectWithOther, T as TextArea, B as Button } from "../server-entry.mjs";
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
const $$_tpl_1 = ['<p class="text-xl leading-8 text-gray-600"><i>With your help, we can improve healthcare in Africa</i></p>'];
async function PartnerPage(ctx) {
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Partner With Us | Virtual Hospitals Africa",
    children: u(SideBySide, {
      image: "https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg",
      h1: "Partner With Us",
      children: [a($$_tpl_1), u(Form, {
        method: "POST",
        action: "/interest",
        className: "w-full mt-4",
        children: [u(FormRow, {
          children: u(TextInput, {
            name: "name",
            required: true
          })
        }), u(FormRow, {
          children: u(TextInput, {
            name: "email",
            type: "email",
            required: true
          })
        }), u(FormRow, {
          children: u(SelectWithOther, {
            name: "support",
            label: "What kind of support might you be interested in offering?",
            options: ["Funding", "Technical/Research Partnership", "Local Health Organization Partnership", "Medical Support", "Medical Equipment", "Software Development", "Networking", "Media/Journalism", "Showcases/Events"],
            children: ""
          })
        }), u(FormRow, {
          children: u(TextArea, {
            name: "message",
            rows: 3
          })
        }), u(FormRow, {
          className: "container mt-2",
          children: u(Button, {
            type: "submit",
            children: "Submit"
          })
        })]
      })]
    })
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___partner = PartnerPage;
export {
  config,
  css,
  _freshRoute___partner as default,
  handler,
  handlers
};
