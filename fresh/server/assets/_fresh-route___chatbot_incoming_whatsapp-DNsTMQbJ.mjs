import { m as assert, ei as conversations, d as db, ej as get, ek as getBinaryData } from "../server-entry.mjs";
import { m as media } from "./media-DY7RW76U.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const WHATSAPP_PATIENT_CHATBOT_NUMBER = "263784010987";
const WHATSAPP_PHARMACIST_CHATBOT_NUMBER = "263712093355";
const PHONE_TO_CHATBOT_NAME = {
  [WHATSAPP_PATIENT_CHATBOT_NUMBER]: "patient",
  [WHATSAPP_PHARMACIST_CHATBOT_NUMBER]: "pharmacist"
};
const verify_token = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN");
async function downloadAndInsertMedia(media_id) {
  const resp = await get(media_id);
  const {
    url,
    mime_type
  } = resp;
  const binary_data = await getBinaryData(url);
  const inserted_media = await media.insert(db, {
    binary_data,
    mime_type
  });
  return inserted_media.id;
}
async function getContents(message) {
  switch (message.type) {
    case "audio":
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.audio.id),
        body: null
      };
    case "video":
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.video.id),
        body: null
      };
    case "document":
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.document.id),
        body: null
      };
    case "image":
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.image.id),
        body: null
      };
    case "text":
      return {
        has_media: false,
        media_id: null,
        body: message.text.body
      };
    case "location":
      return {
        has_media: false,
        media_id: null,
        body: JSON.stringify(message.location)
      };
    case "interactive": {
      const body = message.interactive.type === "list_reply" ? message.interactive.list_reply.id : message.interactive.button_reply.id;
      return {
        has_media: false,
        media_id: null,
        body
      };
    }
    case "contacts": {
      throw new Error("Not yet handled");
    }
    default: {
      throw new Error("Unknown message.type");
    }
  }
}
const handler$1 = {
  GET(ctx) {
    const {
      searchParams
    } = ctx.url;
    const hub_mode = searchParams.get("hub.mode");
    const hub_verify_token = searchParams.get("hub.verify_token");
    const hub_challenge = searchParams.get("hub.challenge");
    if (hub_mode === "subscribe" && hub_verify_token === verify_token) {
      return new Response(hub_challenge);
    }
    return new Response("Invalid token");
  },
  async POST(ctx) {
    const req = ctx.req;
    const incoming_message = await req.json();
    console.log(JSON.stringify(incoming_message));
    if (incoming_message.object !== "whatsapp_business_account") {
      console.error("Object is not whatsapp_business_account");
      return new Response("Unexpected object", {
        status: 400
      });
    }
    const [entry, ...otherEntries] = incoming_message.entry;
    if (otherEntries.length) {
      console.error("More than one entry in the message, that's weird");
    }
    const [change, ...otherChanges] = entry.changes;
    if (otherChanges.length) {
      console.error("More than one change in the entry, that's weird");
    }
    const {
      display_phone_number
    } = change.value.metadata;
    assert(display_phone_number === WHATSAPP_PHARMACIST_CHATBOT_NUMBER || display_phone_number === WHATSAPP_PATIENT_CHATBOT_NUMBER, "Phone number is not the pharmacist or patient phone number");
    const chatbot_name = PHONE_TO_CHATBOT_NAME[display_phone_number];
    if (change.value.statuses) {
      const [status, ...otherStatuses] = change.value.statuses;
      if (otherStatuses.length) {
        console.error("More than one status in the change, that's weird");
      }
      await conversations.updateReadStatus(db, {
        whatsapp_id: status.id,
        read_status: status.status
      });
    }
    if (change.value.messages) {
      const [message, ...otherMessages] = change.value.messages;
      if (otherMessages.length) {
        console.error("More than one message in the change, that's weird");
      }
      const timestamp = 1e3 * parseInt(message.timestamp, 10);
      const now = Date.now();
      console.log(`now: ${now} Message timestamp ${timestamp}`);
      if (now - timestamp > 1e3 * 60 * 10) {
        console.error("Message is more than ten minutes old");
        return new Response("Message is more than ten minutes old", {
          status: 400
        });
      }
      const contents = await getContents(message);
      await conversations.insertMessageReceived(db, {
        sent_by_phone_number: message.from,
        received_by_phone_number: display_phone_number,
        whatsapp_id: message.id,
        chatbot_name,
        ...contents
      });
    }
    return new Response("OK");
  }
  // TODO handle messages like this {"object":"whatsapp_business_account","entry":[{"id":"103214822804490","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"263712093355","phone_number_id":"113792741736396"},"messages":[{"from":"263782057099","id":"wamid.HBgMMjYzNzgyMDU3MDk5FQIAEhgSNDY4MDg4NzBCQkEyRjg3Q0M5AA==","timestamp":"1687676124","system":{"body":"User A changed from ‎263782057099 to 263719057099‎","wa_id":"263719057099","type":"user_changed_number"},"type":"system"}]},"field":"messages"}]}]}
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___chatbot_incoming_whatsapp = void 0;
export {
  config,
  css,
  _freshRoute___chatbot_incoming_whatsapp as default,
  handler,
  handlers
};
