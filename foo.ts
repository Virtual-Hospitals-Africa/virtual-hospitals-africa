import * as conversations from "./src/models/conversations.ts";

conversations.insertMessageReceived({
  patient_phone_number: "1234567890",
  whatsapp_id: "1234567890",
  body: "Hello",
});
