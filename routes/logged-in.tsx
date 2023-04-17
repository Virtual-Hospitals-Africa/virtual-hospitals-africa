import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { assert } from "https://deno.land/std@0.178.0/_util/asserts.ts";
import { getInitialTokensFromAuthCode } from "../src/google.ts";
import { initializeDoctor } from "../src/initializeDoctor.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  async GET(req, ctx) {
    const { session } = ctx.state;
    const code = new URL(req.url).searchParams.get("code");

    assert(code, "No code found in query params");

    const tokens = await getInitialTokensFromAuthCode(code);
    const doctor = await initializeDoctor(tokens);

    for (const [key, value] of Object.entries({ ...doctor, ...tokens })) {
      session.set(key, value);
    }
    console.log("mmmmm", session);
    console.log("mmmmm", session.get("access_token"));

    return new Response("Found", {
      status: 302,
      headers: { Location: "/app" },
    });
  },
};
