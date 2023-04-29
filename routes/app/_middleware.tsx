import { MiddlewareHandlerContext } from "https://deno.land/x/fresh@1.1.5/server.ts";
import { WithSession } from "fresh_session";
import { isGoogleTokens } from "../../external-clients/google.ts";
import redirect from "../../util/redirect.ts";

// Ensure user has session with Google tokens
export const handler = [
  (_req: Request, ctx: MiddlewareHandlerContext<WithSession>) => {
    const isAuthedDoctor = isGoogleTokens({
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    });
    if (isAuthedDoctor) return ctx.next();
    return redirect("/");
  },
];
