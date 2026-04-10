import { aU as base, cw as identity, bO as now, a6 as isoDate, aG as jsonBuildObject, a3 as concat, d8 as literalString, bf as jsonArrayFrom, d9 as literalNumber, g as getRequiredUUIDParam } from "../server-entry.mjs";
import { m as medications } from "./medications-Co2lw_jP.mjs";
import { j as jsonSearchHandler } from "./jsonSearchHandler-Bfi3q4C9.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./responses-Vcjs2Fhe.mjs";
const medication_availabilities = base({
  top_level_table: "medications",
  baseQuery(trx, {
    country,
    include_recalled,
    ...opts
  }) {
    return medications.baseQuery(trx, opts).innerJoin("medication_availabilities", "medication_availabilities.medication_id", "medications.id").leftJoin("medication_recalls", "medication_recalls.medication_availability_id", "medications.id").select((eb) => ["country", "registration_number", isoDate(eb.ref("medication_recalls.recalled_at")).as("recalled_at"), jsonBuildObject({
      recall: eb.case().when("recalled_at", "is", null).then(concat("/regulator/medications/", eb.ref("medications.id"), "/recall")).end()
    }).as("actions")]).$if(!include_recalled, (eb) => eb.where("medication_recalls.recalled_at", "is", null)).$if(!!country, (eb) => eb.where("medication_availabilities.country", "=", country));
  },
  formatResult: identity,
  recall(trx, data) {
    return trx.insertInto("medication_recalls").values({
      recalled_by: data.regulator_id,
      medication_availability_id: data.medication_availability_id,
      recalled_at: now
    }).returning("id").executeTakeFirstOrThrow();
  },
  unrecall(trx, data) {
    return trx.deleteFrom("medication_recalls").where("id", "=", data.id).execute();
  }
});
const medication_organizations = base({
  top_level_table: "medications",
  baseQuery(trx, {
    organization_id,
    ...opts
  }) {
    return medication_availabilities.baseQuery(trx, opts).select((eb) => [literalString(organization_id).as("organization_id"), jsonArrayFrom(eb.selectFrom("medication_doses").leftJoin("organization_consumables", (join) => join.onRef("medication_doses.id", "=", "organization_consumables.consumable_id").on("organization_consumables.organization_id", "=", organization_id)).whereRef("medication_doses.medication_id", "=", "medications.id").select((eb_medication_doses) => ["medication_doses.id as medication_dose_id", eb_medication_doses.fn.coalesce("organization_consumables.quantity_on_hand", literalNumber(0)).as("quantity_on_hand"), jsonBuildObject({
      add: concat(`/app/organizations/${organization_id}/inventory/add_medication_dose?medication_dose_id=`, eb_medication_doses.ref("medication_doses.id")),
      history: concat(`/app/organizations/${organization_id}/inventory/history?consumable_id=`, eb_medication_doses.ref("medication_doses.id"))
    }).as("actions")])).as("organization_doses")]).where("medication_availabilities.country", "=", trx.selectFrom("organizations").where("organizations.id", "=", organization_id).select("country"));
  },
  formatResult: identity
});
const handler$1 = jsonSearchHandler(medication_organizations, (ctx) => ({
  organization_id: getRequiredUUIDParam(ctx, "organization_id")
}));
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_medications = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_medications as default,
  handler,
  handlers
};
