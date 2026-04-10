import { cm as entries, aO as blankSelection, aQ as success_true, dE as pMap, bf as jsonArrayFrom, a, u, av as Form, dF as PriorityDropdown, dG as TargetsRow, l, dH as RichTextEditor, B as Button, H as HealthWorkerHomePage, g as getRequiredUUIDParam, F as object, _ as _enum, G as string, b3 as record, dI as parseRequest, a7 as literal } from "../server-entry.mjs";
import { B as BY_TARGET_UUID, m as message_targets, g as groupByCategory } from "./message_targets-Bq9oC8ah.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./pluralize-HYG0Q538.mjs";
function baseQuery(trx) {
  return trx.selectFrom("message_drafts").select((eb) => ["message_drafts.id", "message_drafts.employment_id", "message_drafts.body", "message_drafts.priority", "message_drafts.created_at", "message_drafts.updated_at", jsonArrayFrom(eb.selectFrom("message_draft_targets").whereRef("message_draft_targets.message_draft_id", "=", "message_drafts.id").select(["message_draft_targets.id", "message_draft_targets.target_type", "message_draft_targets.target_uuid", "message_draft_targets.target_value"])).as("targets")]);
}
const message_drafts = {
  async findById(trx, {
    draft_id
  }) {
    const draft = await baseQuery(trx).where("message_drafts.id", "=", draft_id).executeTakeFirst();
    if (!draft) return;
    const targets = await pMap(draft.targets, (t) => message_targets.getTarget(trx, t));
    return {
      ...draft,
      targets
    };
  },
  removeById(trx, draft_id) {
    return trx.deleteFrom("message_drafts").where("id", "=", draft_id).execute();
  },
  save(trx, {
    message_draft_id,
    targets = {},
    ...updates
  }) {
    const draft_targets = entries(targets).flatMap(([target_type, target_strings = []]) => {
      const by_uuid = BY_TARGET_UUID.has(target_type);
      return target_strings.map((target_string) => ({
        message_draft_id,
        target_type,
        target_uuid: by_uuid ? target_string : null,
        target_value: by_uuid ? null : target_string
      }));
    });
    return trx.with("inserting_draft", (qb) => qb.insertInto("message_drafts").values({
      id: message_draft_id,
      ...updates
    }).onConflict((oc) => oc.column("id").doUpdateSet(updates))).with("removing_existing_targets", (qb) => qb.deleteFrom("message_draft_targets").where("message_draft_id", "=", message_draft_id)).with("inserting_new_targets", (qb) => draft_targets.length ? qb.insertInto("message_draft_targets").values(draft_targets) : blankSelection(qb)).selectNoFrom([success_true]).executeTakeFirstOrThrow();
  }
};
const $$_tpl_2 = ['<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h1 class="text-2xl font-semibold text-gray-900">Draft Message</h1>', '</div><div class="space-y-0">', "", "", '<span class="ml-auto text-sm text-gray-600 whitespace-nowrap">Total recipient count: 98</span><div class="flex items-center gap-2 px-6 py-3 border-b border-gray-200"><label class="text-sm text-gray-700 w-24 flex-shrink-0">Subject:</label><div class="flex-1"><input type="text" name="subject" ', ' class="block w-full border-0 py-0 px-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm" placeholder="Enter subject..."></div></div><div class="px-6 py-4">', '</div><div class="flex justify-end gap-3 px-6 py-4">', "", "</div></div>"];
const $$_tpl_1 = ['<div class="max-w-6xl mx-auto p-8">', "</div>"];
function MessageDraft({
  draft = {}
}) {
  const priority = draft.priority ?? "Emergency";
  const body = draft.body ?? "";
  const subject = "What is the correct dosage?";
  const targets = groupByCategory(draft.targets || []);
  return a($$_tpl_1, u(Form, {
    method: "POST",
    class: "bg-white shadow-sm rounded-lg",
    children: a($$_tpl_2, u(PriorityDropdown, {
      name: "priority",
      initial_priority: priority
    }), u(TargetsRow, {
      label: "Regions",
      message_target_category: "regions",
      targets: targets.get("regions") || []
    }), u(TargetsRow, {
      label: "Facilities",
      message_target_category: "organizations",
      targets: targets.get("organizations") || []
    }), u(TargetsRow, {
      label: "Recipients",
      message_target_category: "health_workers",
      targets: targets.get("health_workers") || []
    }), l("value", subject), u(RichTextEditor, {
      name: "body",
      initial_value: body
    }), u(Button, {
      type: "button",
      variant: "secondary",
      children: "Save to drafts"
    }), u(Button, {
      type: "submit",
      variant: "primary",
      children: "Send Message"
    }))
  }));
}
const MessageTargetSchema = record(string(), literal(true)).transform((value) => Object.keys(value)).optional();
const MessageDraftSchema = object({
  body: string(),
  priority: _enum(["Non-urgent", "Urgent", "Very urgent", "Emergency"]),
  action: _enum(["save_draft", "send_message"]),
  targets: object({
    organization: MessageTargetSchema,
    employee: MessageTargetSchema,
    role: MessageTargetSchema,
    organization_category: MessageTargetSchema,
    locality: MessageTargetSchema,
    administrative_area_level_1: MessageTargetSchema,
    administrative_area_level_2: MessageTargetSchema
  })
});
const PartialMessageDraftSchema = MessageDraftSchema.partial();
const handler$1 = postHandler(MessageDraftSchema, async (ctx, form_values) => {
  const message_draft_id = getRequiredUUIDParam(ctx, "message_draft_id");
  if (form_values.action === "save_draft") {
    await message_drafts.save(ctx.state.trx, {
      ...form_values,
      message_draft_id,
      employment_id: ctx.state.organization_employment.employment_id
    });
  }
  return new Response("Draft submitted (not yet implemented)", {
    status: 200
  });
});
async function draftFromFormValues(ctx) {
  const form_values = await parseRequest(ctx.req, PartialMessageDraftSchema.parse);
  const targets = await message_targets.getMany(ctx.state.trx, form_values.targets ?? {});
  return {
    id: getRequiredUUIDParam(ctx, "message_draft_id"),
    employment_id: ctx.state.organization_employment.employment_id,
    body: form_values.body ?? "",
    priority: form_values.priority ?? "Non-urgent",
    targets,
    created_at: /* @__PURE__ */ new Date(),
    updated_at: /* @__PURE__ */ new Date()
  };
}
const _message_draft_id_ = HealthWorkerHomePage("Draft Message", async function DraftPage(ctx) {
  const message_draft_id = getRequiredUUIDParam(ctx, "message_draft_id");
  const draft = await message_drafts.findById(ctx.state.trx, {
    draft_id: message_draft_id
  }) || await draftFromFormValues(ctx);
  return u(MessageDraft, {
    draft
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_messaging_drafts_message_draft_id_ = _message_draft_id_;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_messaging_drafts_message_draft_id_ as default,
  handler,
  handlers
};
