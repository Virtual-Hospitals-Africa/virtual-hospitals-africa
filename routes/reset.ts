import { Handlers } from "$fresh/server.ts";
import db from "../external-clients/db.ts";
import { redis } from "../external-clients/redis.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    await db.deleteFrom("patients").execute();
    await db.deleteFrom("appointments").execute();
    await db.deleteFrom("appointment_offered_times").execute();
    await db.deleteFrom("appointment_offered_times").execute();
    await db.deleteFrom("doctors").execute();
    await db.deleteFrom("doctor_google_tokens").execute();
    await db.deleteFrom("patients").execute();
    await db.deleteFrom("whatsapp_messages_received").execute();
    await db.deleteFrom("whatsapp_messages_sent").execute();

    const keys = await redis.keys("*");
    await Promise.all(keys.map((key) => redis.del(key)));

    return new Response("Everything reset", { status: 200 });
  },
};
