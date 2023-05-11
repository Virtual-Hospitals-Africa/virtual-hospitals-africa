import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import redirect from "../../util/redirect.ts";
import { isDoctorWithGoogleTokens } from "../../models/doctors.ts";

// Ensure user is a doctor who has session with google tokens
export const handler = [
  (_req: Request, ctx: MiddlewareHandlerContext<WithSession>) => {
    const isAuthedDoctor = isDoctorWithGoogleTokens(ctx.state.session.data);
    return isAuthedDoctor ? ctx.next() : redirect("/");
  },
];
