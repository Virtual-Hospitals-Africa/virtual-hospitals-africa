import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { assert } from "std/_util/asserts.ts";
import { getInitialTokensFromAuthCode } from "../src/google.ts";
import { initializeDoctor } from "../src/initializeDoctor.ts";
import redirect from "../src/redirect.ts";

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

    return redirect("/app/calendar");
  },
};
