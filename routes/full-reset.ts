import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { resetDb } from "../external-clients/db.ts";
import { redis } from "../external-clients/redis.ts";

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(_req, ctx) {
    await resetDb();

    const keys = await redis.keys("*");
    await Promise.all(keys.map((key) => redis.del(key)));

    const { session } = ctx.state;
    session.destroy();

    return new Response("Everything reset", { status: 200 });
  },
};
