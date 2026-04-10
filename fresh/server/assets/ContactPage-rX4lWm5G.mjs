import { i as last, u, a, av as Form, aD as HiddenInput, K as FormRow, aB as TextInput, T as TextArea, B as Button, b as s, aF as PageHeader } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
const $$_tpl_1 = ['<div class="overflow-hidden bg-white py-32"><div class="mx-auto max-w-7xl px-6 lg:flex lg:px-8"><div class="flex gap-6"><div>', '<div class="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">', "", '</div></div><div class="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents"><div class="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-start">', "</div></div></div></div></div>"];
function ContactPage(props) {
  const entrypoint = last(props.url.toString().split("/"));
  return u(JustLogoLayout, {
    url: props.url,
    title: `${props.title} | Virtual Hospitals Africa`,
    children: a($$_tpl_1, u(PageHeader, {
      className: "h1",
      children: props.title
    }), s(props.message), u(Form, {
      method: "POST",
      action: "/interest",
      className: "w-full mt-4 min-w-112.5",
      children: [u(HiddenInput, {
        name: "entrypoint",
        value: entrypoint
      }), u(FormRow, {
        className: "w-full",
        children: u(TextInput, {
          name: "name",
          required: true
        })
      }), u(FormRow, {
        className: "w-full",
        children: u(TextInput, {
          name: "email",
          type: "email",
          required: true
        })
      }), u(FormRow, {
        className: "w-full",
        children: u(TextArea, {
          name: "message",
          rows: 3
        })
      }), u(FormRow, {
        className: "container w-full mt-2",
        children: u(Button, {
          type: "submit",
          children: "Submit"
        })
      })]
    }), u("img", {
      src: "https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg",
      alt: "",
      class: "aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover"
    }))
  });
}
export {
  ContactPage as C
};
