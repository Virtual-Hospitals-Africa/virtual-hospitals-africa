import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { oauthParams } from "../external-clients/google.ts";
import { isDoctorWithGoogleTokens } from "../models/doctors.ts";
import redirect from "../util/redirect.ts";

export const handler: Handlers<Record<string, never>, WithSession> = {
  GET(_req, ctx) {
    const isAuthedDoctor = isDoctorWithGoogleTokens(ctx.state.session.data);
    const Location = isAuthedDoctor
      ? "/app/calendar/set-availability"
      : `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`;

    return redirect(Location);
  },
};
