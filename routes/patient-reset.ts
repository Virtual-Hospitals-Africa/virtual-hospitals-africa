import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { remove } from "../models/patients.ts";

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(_req, ctx) {
    const { phone_number } = ctx.params;
    await remove({ phone_number });
    return new Response("Everything reset", { status: 200 });
  },
};
