import "dotenv";
import {
  MessageOption,
  WhatsAppJSONResponse,
  WhatsAppSendable,
  WhatsAppSendableList,
  WhatsAppSendableButtons,
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

// May 11
// 10am with Dr. Jones [ ]
// 10:30am with Dr. Simone [ ]

// May 12
// 10am with Dr. Jones [ ]
// 10:30am with Dr. Simone [ ]
// 11am with Dr. Simone [ ]

// const toPost: {
//   method: string;
//   headers: {
//       Authorization: string;
//       "Content-Type": string;
//   };
//   body: {
//       messaging_product: string;
//       to: string;
//       type: string;
//       interactive: {
//           type: string;
//           header: {
//               type: string;
//               text: string;
//           };
//           body: {
//               ...;
//           };
//           footer: {
//               ...;
//           };
//           action: {
//               ...;
//           };
//       };
//   };
// }

export async function sendMessageWithInteractiveList(opts: {
  phone_number: string;
  headerText: string;
  messageBody: string;
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
          button: "Available time",
          sections: [
            {
              title: "20230518",
              rows: [
                {
                  id: "202305181000",
                  title: "10am",
                  description: "appointment 1",
                },
                { id: "202305181030",
                  title: "10:30am",
                  description: "10:30am"
                }
              ],
            },
            {
              title: "20230519",
              rows: [
                {
                  id: "unique-row-identifier2",
                  title: "10:30am",
                  description: "description 2",
                },
              ],
            },
          ],
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