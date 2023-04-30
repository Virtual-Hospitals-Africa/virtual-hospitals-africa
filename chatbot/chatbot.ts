import db from "../external-clients/db.ts";
import {
  getUnhandledPatientMessages,
  markChatbotError,
} from "../models/conversations.ts";
import { determinePatientMessage } from "./determinePatientMessage.ts";
import { send } from "./send.ts";

const commitHash = Deno.env.get("HEROKU_SLUG_COMMIT") || "local";

export type Responder = { start(): void; exit(): void };

export function createChatbot(): Responder {
  let timer: number;

  // TODO: handle receiving more than one message in a row from same patient
  async function respond(): Promise<void> {
    const unhandledMessages = await getUnhandledPatientMessages({ commitHash });
    await Promise.all(unhandledMessages.map(async (patientMessage) => {
      try {
        const toSend = await db.transaction().execute((trx) =>
          determinePatientMessage(trx, patientMessage)
        );
        console.log("toSend", JSON.stringify(toSend));
        await send(toSend, patientMessage);
      } catch (err) {
        console.log("Error determining message to send");
        console.error(err);
        await send(`An unknown error occured: ${err.message}`, patientMessage);
        await markChatbotError({
          commitHash,
          whatsapp_message_received_id: patientMessage.message_id,
          errorMessage: err.message,
        });
      }
    }));
    // TODO: it seems like this recursion might be causing a memory leak?
    // A setInterval isn't quite right because we want to wait for the
    // previous batch of messages to be done processing before starting again.
    timer = setTimeout(respond, 10);
  }

  return {
    start: respond,
    exit(): void {
      console.log("Exiting chatbot");
      clearTimeout(timer);
    },
  };
}

createChatbot().start();
