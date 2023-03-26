// import { assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";
// import { RouterContext } from "koa-router";
// import * as google from "../google";
// import { initializeDoctor } from "../initializeDoctor";

// export async function loggedIn(ctx: RouterContext): Promise<any> {
//   assert(ctx.query.code, "No code in query");
//   const tokens = await google.getInitialTokensFromAuthCode(
//     String(ctx.query.code),
//   );
//   const doctor = await initializeDoctor(ctx, tokens);

//   Object.assign(ctx.session!, doctor);

//   return ctx.redirect("/app");
// }
