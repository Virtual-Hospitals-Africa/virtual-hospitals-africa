import { Handlers } from "$fresh/server.ts";
import { resetDb } from "../external-clients/db.ts";
import { redis } from "../external-clients/redis.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    await resetDb();
    const keys = await redis.keys("*");
    console.log("keys", keys);
    await Promise.all(keys.map((key) => redis.del(key)));

    return new Response("Everything reset", { status: 200 });
  },
};
