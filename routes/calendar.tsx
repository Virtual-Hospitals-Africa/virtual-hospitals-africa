// import { assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";
// import { RouterContext } from "koa-router";
// import * as google from "../google";
// import * as doctors from "../models/doctors";
// import * as pug from "../pug";

// const awaitingRenderer = pug.init();

// export async function calendar(ctx: RouterContext): Promise<any> {
//   assert(ctx.session, "No session");
//   assert(ctx.session.doctorId, "No doctorId in session");

//   const doctor = await doctors.getWithTokensById(ctx.session.doctorId);

//   const googleAgent = new google.Agent(doctor);

//   const events = await googleAgent.getEvents(
//     doctor.gcal_appointments_calendar_id,
//   );

//   const renderer = await awaitingRenderer;
//   ctx.body = renderer.calendar({ events: events.items });
// }
import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { isGoogleTokens } from "../src/google.ts";

export type HasSession = { session: Record<string, string> };

export const handler: Handlers<HasSession, WithSession> = {
  GET(_req, ctx) {
    const { session } = ctx.state;
    console.log(session.data);
    return Response.redirect("/logged-in", 302);
  },
};
