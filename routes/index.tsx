import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { isGoogleTokens, oauthParams } from "../external-clients/google.ts";
import redirect from "../util/redirect.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    const isAuthedDoctor = isGoogleTokens({
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    });
    const Location = isAuthedDoctor
      ? "/app/calendar/set-availability"
      : `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`;

    return redirect(Location);
  },
};
