import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    const { session } = ctx.state;
    console.log(session.data);
    return new Response("OK", { status: 200 });
  },
};
