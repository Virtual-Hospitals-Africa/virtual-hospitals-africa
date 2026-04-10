import { u, av as Form, K as FormRow, ee as SelectWithOptions, aB as TextInput, T as TextArea, B as Button } from "../server-entry.mjs";
const CONTACT_REASON_OPTIONS = [{
  value: "mailing_list_signup",
  label: "Sign up for mailing list"
}, {
  value: "general_inquiry",
  label: "General Inquiry"
}, {
  value: "book_a_demo",
  label: "Book a demo"
}, {
  value: "book_an_intro_call",
  label: "Book an intro call"
}, {
  value: "request_investor_deck",
  label: "Request investor deck"
}];
function ContactForm({
  reason
}) {
  return u(Form, {
    method: "POST",
    action: "/interest",
    className: "w-full",
    children: [u(FormRow, {
      className: "w-full",
      children: u(SelectWithOptions, {
        name: "reason",
        required: true,
        value: reason,
        options: CONTACT_REASON_OPTIONS
      })
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
        className: "w-full",
        children: "Submit"
      })
    })]
  });
}
export {
  CONTACT_REASON_OPTIONS as C,
  ContactForm as a
};
