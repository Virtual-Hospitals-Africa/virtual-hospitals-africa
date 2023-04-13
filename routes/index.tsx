import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { isGoogleTokens, oauthParams } from "../src/google.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    console.log(arguments);
    const { session } = ctx.state;

    const tokens = {
      access_token: session.get("access_token"),
      refresh_token: session.get("refresh_token"),
    };

    // console.log(tokens);
    // return Response.json("Hello World");

    if (isGoogleTokens(tokens)) {
      return Response.redirect("/logged-in", 302);
    } else {
      console.log(
        "Not logged in",
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`,
      );
      const resp = new Response("Moved Permanently", { status: 302 });
      resp.headers.set(
        "Location",
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`,
      );
      return resp;
    }
  },
};
