import { aU as base, m as assert, aI as sql, aG as jsonBuildObject, bf as jsonArrayFrom, au as employees } from "../server-entry.mjs";
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
function randomWait() {
  const seed = Math.random();
  if (seed < 0.7) {
    return {
      status: "open (short wait)",
      minutes: 57,
      display: "1 hour"
    };
  }
  if (seed < 0.8) {
    return {
      status: "open (long wait)",
      minutes: 235,
      display: "4 hours"
    };
  }
  if (seed < 0.9) {
    return {
      status: "closing soon",
      minutes: 110,
      display: "2 hours"
    };
  }
  return {
    status: "closed"
  };
}
const nearest_organizations = base({
  top_level_table: "organizations",
  baseQuery(trx, search) {
    assert(search?.location, "Must provide a location to measure distance from");
    const distance_sql = sql`organizations.location <-> ST_SetSRID(ST_MakePoint(${search.location.longitude}, ${search.location.latitude}), 4326)::geography`;
    return trx.selectFrom("organizations").innerJoin("addresses", "address_id", "addresses.id").where("inactive_reason", "is", null).where("location", "is not", null).select((eb) => ["organizations.id", "organizations.name", "organizations.category", "addresses.formatted as address", "addresses.locality", jsonBuildObject({
      longitude: sql`ST_X(location::geometry)`,
      latitude: sql`ST_Y(location::geometry)`
    }).as("location"), distance_sql.as("distance_meters"), sql`'https://maps.google.com'`.as("google_maps_link"), sql`'Open'`.as("status"), jsonArrayFrom(employees.baseQuery(trx, {}).where("employment.is_admin", "=", true).where("employment.organization_id", "=", eb.ref("organizations.id"))).as("admins"), jsonArrayFrom(employees.baseQuery(trx, {}).where("employment.role", "=", "doctor").where("employment.organization_id", "=", eb.ref("organizations.id"))).as("doctors"), jsonArrayFrom(eb.selectFrom("organization_departments").innerJoin("departments", "departments.name", "organization_departments.name").select(["organization_departments.id", "organization_departments.name", "departments.requires_triage"]).whereRef("organization_departments.organization_id", "=", "organizations.id")).as("departments")]).$if(search.kind === "hospital", (qb) => qb.where("category", "ilike", "%hospital%")).$if(!!search.search, (qb) => qb.where("organizations.name", "ilike", `%${search.search}%`)).$if(!!search.excluding_id, (qb) => qb.where("organizations.id", "!=", search.excluding_id)).$if(!!search.has_doctors, (qb) => qb.where((eb) => eb.selectFrom("employment as doctor_employment").whereRef("doctor_employment.organization_id", "=", "organizations.id").where("doctor_employment.role", "=", "doctor").select((eb2) => eb2.fn.count("doctor_employment.id").as("doctor_count")), ">", 0)).orderBy(distance_sql).limit(search?.limit || 5);
  },
  formatResult: (organization) => ({
    ...organization,
    business_hours: "M-F 9am-5pm",
    wait: randomWait(),
    re_opens: {
      display: "Reopens tomorrow 9am"
    }
  })
});
const handler$1 = jsonSearchHandler(nearest_organizations, (ctx) => ({
  location: ctx.state.organization.location,
  excluding_id: ctx.state.organization.id
  // has_doctors: true,
}));
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_nearest_organizations = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_nearest_organizations as default,
  handler,
  handlers
};
