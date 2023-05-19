import "dotenv";
import {
  MessageOption,
  WhatsAppJSONResponse,
  WhatsAppSendable,
  MessageAction
} from "../types.ts";

const postMessageRoute = `https://graph.facebook.com/v15.0/${Deno.env.get(
  "WHATSAPP_FROM_PHONE_NUMBER"
)}/messages`;
const Authorization = `Bearer ${Deno.env.get("WHATSAPP_BEARER_TOKEN")}`;

export function sendMessage({
  phone_number,
  message,
}: {
  phone_number: string;
  message: WhatsAppSendable;
}): Promise<
  | WhatsAppJSONResponse
  | {
      messaging_product: "whatsapp";
      contacts: [{ input: string; wa_id: string }];
      messages: [{ id: string }];
    }
> {
  switch (message.type) {
    case "string":
      return sendMessagePlainText({
        phone_number,
        message: message.messageBody,
      });
    case "buttons":
      return sendMessageWithInteractiveButtons({
        phone_number,
        options: message.options,
        messageBody: message.messageBody,
      });
    case "list":
      console.log("This is message type", message.type);
      return sendMessageWithInteractiveList({
        phone_number,
        headerText: message.headerText,
        messageBody: message.messageBody,
        action: message.action
      });
  }
}

export async function sendMessagePlainText(opts: {
  phone_number: string;
  message: string;
}): Promise<WhatsAppJSONResponse> {
  const response = await fetch(postMessageRoute, {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      text: { body: opts.message },
    }),
  });

  return response.json();
}

export async function sendMessageWithInteractiveButtons(opts: {
  phone_number: string;
  messageBody: string;
  options: MessageOption[];
}): Promise<WhatsAppJSONResponse> {
  const toPost = {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: opts.messageBody,
        },
        action: {
          buttons: opts.options.map((option) => ({
            type: "reply",
            reply: option,
          })),
        },
      },
    }),
  };

  console.log("toPost", JSON.stringify(toPost));

  const response = await fetch(postMessageRoute, toPost);

  return response.json();
}

export async function sendMessageWithInteractiveList(opts: {
  phone_number: string;
  headerText: string;
  messageBody: string;
  action: MessageAction;
}): Promise<{
  messaging_product: "whatsapp";
  contacts: [{ input: string; wa_id: string }];
  messages: [{ id: string }];
}> {
  console.log("List was called");

  const toPost = {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: `${opts.headerText}`,
        },
        body: {
          text: `${opts.messageBody}`,
        },
        action: {
          button: opts.action.button,
          sections: opts.action.sections.map((section) => ({
            ...section,
            rows: section.rows.map((row) => ({
              ...row,
            })),
          })),
        },
      },
    }),
  };

  console.log("toPost", JSON.stringify(toPost));

  const response = await fetch(postMessageRoute, toPost);

  return response.json();
}

// await sendMessageWithInteractiveList({
//   phone_number: "12369961017",
//   headerText: "Hello",
//   messageBody: "Hi there"

// })