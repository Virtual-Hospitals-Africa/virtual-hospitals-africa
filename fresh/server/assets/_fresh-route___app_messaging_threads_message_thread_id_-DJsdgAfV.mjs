import { aU as base, dJ as isString, H as HealthWorkerHomePage, g as getRequiredUUIDParam, m as assert, e6 as messages, dK as message_threads, u, e7 as ChatThread, F as object, G as string } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
function baseQuery(trx, opts) {
  return trx.selectFrom("message_thread_participants").select(["message_thread_participants.id as participant_id", "message_thread_participants.table_name", "message_thread_participants.row_id"]).$if(!!opts.thread_id, (qb) => qb.where("message_thread_participants.thread_id", "in", isString(opts.thread_id) ? [opts.thread_id] : opts.thread_id)).$if(!!opts.employee_ids, (qb) => qb.where("message_thread_participants.table_name", "=", "employment").where("row_id", "in", opts.employee_ids));
}
const message_thread_participants = base({
  top_level_table: "message_thread_participants",
  baseQuery,
  formatResult: (x) => x
});
const MessageSchema = object({
  message: string()
});
const handler$1 = postHandler(MessageSchema, async (ctx, form_values) => {
  const thread_id = getRequiredUUIDParam(ctx, "message_thread_id");
  const employee_ids = ctx.state.health_worker.organizations.map((e) => e.employment_id);
  assert(employee_ids.length, "Must complete onboarding first");
  const message = await messages.send(ctx.state.trx, {
    thread_id,
    body: form_values.message,
    sender_participant_id: message_thread_participants.distinctIds(ctx.state.trx, {
      thread_id,
      employee_ids
    })
  });
  console.log("message", message);
  return new Response("Message Created", {
    status: 201
  });
});
const _message_thread_id_ = HealthWorkerHomePage("Messaging", async function MessagingPage(ctx) {
  const thread_id = getRequiredUUIDParam(ctx, "message_thread_id");
  const thread = await message_threads.getOneForHealthWorker(ctx.state.trx, ctx.state.health_worker, thread_id);
  return u(ChatThread, {
    thread
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_messaging_threads_message_thread_id_ = _message_thread_id_;
export {
  config,
  css,
  _freshRoute___app_messaging_threads_message_thread_id_ as default,
  handler,
  handlers
};
