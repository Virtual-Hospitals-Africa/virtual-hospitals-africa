import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { isGoogleTokens, oauthParams } from "../src/google.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    const tokens = {
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    };

    console.log(
      "faiwoow",
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`,
    );

    if (isGoogleTokens(tokens)) {
      return new Response("Found", {
        status: 302,
        headers: { Location: "/app" },
      });
    } else {
      return new Response("Found", {
        status: 302,
        headers: {
          Location:
            `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`,
        },
      });
    }
  },
};
