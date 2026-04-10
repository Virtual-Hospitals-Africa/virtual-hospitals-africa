import { u, a, b as s, av as Form, K as FormRow, aB as TextInput, aC as SelectWithOther, T as TextArea, aD as HiddenInput, B as Button } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { S as SideBySide } from "./SideBySide-C6xl9IQw.mjs";
const $$_tpl_1 = ['<div class="text-xl leading-8 text-gray-600">', "</div>"];
function SignupTemplate({
  url,
  title,
  h1,
  entrypoint,
  rationale
}) {
  return u(JustLogoLayout, {
    url,
    title,
    children: u(SideBySide, {
      image: "https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg",
      h1,
      children: [a($$_tpl_1, s(rationale)), u(Form, {
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
            label: "Any particular interest?",
            options: ["Technical/Research Partnership", "Local Health Organization Partnership", "Medical Support", "Medical Equipment", "Software Development", "Networking", "Media/Journalism", "Showcases/Events", "Funding"],
            children: ""
          })
        }), u(FormRow, {
          children: u(TextArea, {
            name: "message",
            rows: 3
          })
        }), u(HiddenInput, {
          name: "entrypoint",
          value: entrypoint
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
export {
  SignupTemplate as S
};
