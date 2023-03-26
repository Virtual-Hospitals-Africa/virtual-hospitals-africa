// import { identity } from "https://deno.land/x/lodash@4.17.19/dist/lodash.js";
// import Router = require("koa-router");
// import send = require("koa-send");
// import * as handlers from "./handlers";
// import { join, parse, ParsedPath } from "path";
// import { isGoogleTokens, oauthParams } from "./google";
// import { getAllDoctorAvailability } from "./getDoctorAvailability";
// import { readdirSync } from "fs";

// function* files(
//   ...dirs: string[]
// ): IterableIterator<ParsedPath & { full: string }> {
//   for (const dir of dirs) {
//     for (const name of readdirSync(join(__dirname, "..", dir))) {
//       const parsed = parse(name);
//       // Yield all files in subdirectories
//       if (!parsed.ext) {
//         yield* files(`${dir}/${name}`);
//       } else {
//         yield { ...parsed, full: `${dir}/${parsed.base}` };
//       }
//     }
//   }
// }

// export function createRouter(
//   withRouter: (router: Router) => Router = identity,
// ): Router {
//   const v1Router = withRouter(new Router())
//     .get("/webhook", (ctx) => {
//       if (
//         ctx.query["hub.mode"] === "subscribe" &&
//         ctx.query["hub.verify_token"] ===
//           process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
//       ) {
//         return (ctx.body = ctx.query["hub.challenge"]);
//       }
//       return (ctx.body = "Invalid token");
//     })
//     .post("/webhook", handlers.postWebhook);

//   const router = new Router()
//     .get("/", async (ctx) => {
//       if (isGoogleTokens(ctx.session)) {
//         return ctx.redirect("/app");
//       } else {
//         return ctx.redirect(
//           `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`,
//         );
//       }
//     })
//     .get("/logged-in", handlers.loggedIn)
//     .get("/doctor-availability", async (ctx) => {
//       const doctorAvailability = await getAllDoctorAvailability();
//       return (ctx.body = doctorAvailability);
//     })
//     .get("/app", (ctx) => ctx.redirect("/calendar"))
//     .get("/calendar", handlers.calendar)
//     .get("/set-availability", handlers.availability)
//     .get("/logout", (ctx) => {
//       ctx.session = null;
//       return ctx.redirect("/");
//     })
//     .use("/v1", v1Router.routes(), v1Router.allowedMethods());

//   for (const file of files("/public")) {
//     const route = file.base === "index.html"
//       ? ""
//       : file.ext === ".html"
//       ? file.name
//       : file.base;
//     router.get("/" + route, (ctx) => send(ctx, file.full)); // tslint:disable-line:no-expression-statement
//   }

//   return router;
// }
