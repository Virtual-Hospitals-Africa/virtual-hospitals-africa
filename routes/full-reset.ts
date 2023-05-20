import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import resetDb from "../db/reset.ts";
import { redis } from "../external-clients/redis.ts";

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(_req, ctx) {
    const resettingDb = resetDb();

    const keys = await redis.keys("*");
    await Promise.all(keys.map((key) => redis.del(key)));
    await resettingDb;

    const { session } = ctx.state;
    session.destroy();

    return new Response("Everything reset", { status: 200 });
  },
};
