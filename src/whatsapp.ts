import "dotenv";
import { MessageOptions } from "./types.ts";

const postMessageRoute = `https://graph.facebook.com/v15.0/${
  Deno.env.get("WHATSAPP_FROM_PHONE_NUMBER")
}/messages`;
const Authorization = `Bearer ${Deno.env.get("WHATSAPP_BEARER_TOKEN")}`;

export async function sendMessage(
  opts: { phone_number: string; messageBody: string },
): Promise<{
  messaging_product: "whatsapp";
  contacts: [{ input: string; wa_id: string }];
  messages: [{ id: string }];
}> {
  const response = await fetch(postMessageRoute, {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      text: { body: opts.messageBody },
    }),
  });

  return response.json();
}

export async function sendMessageWithOptions(
  opts: {
    phone_number: string;
    messageBody: string;
    buttonText: string;
    options: MessageOptions[];
  },
): Promise<{
  messaging_product: "whatsapp";
  contacts: [{ input: string; wa_id: string }];
  messages: [{ id: string }];
}> {
  const toPost = {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: opts.messageBody,
        },
        action: {
          button: opts.buttonText,
          sections: opts.options,
        },
      },
    }),
  };

  console.log("toPost", JSON.stringify(toPost));

  const response = await fetch(postMessageRoute, toPost);

  return response.json();
}
