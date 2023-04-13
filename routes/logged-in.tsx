import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { getInitialTokensFromAuthCode } from "../src/google.ts";
import { initializeDoctor } from "../src/initializeDoctor.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  async GET(req, ctx) {
    console.log("ctx.params", ctx.params);
    const code = ctx.params.code;
    const { session } = ctx.state;
    console.log("FII", req.url);

    const tokens = await getInitialTokensFromAuthCode(code);
    const doctor = await initializeDoctor(tokens);

    session.set("doctorId", doctor.id);
    for (const [key, value] of Object.entries(doctor)) {
      session.set(key, value);
    }

    console.log("awekjawlekawe");
    return new Response("OK", { status: 200 });
  },
};
