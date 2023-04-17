import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    return new Response("Found", {
      status: 302,
      headers: { Location: "/calendar" },
    });
  },
};
