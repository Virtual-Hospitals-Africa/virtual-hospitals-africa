import { aU as base, cw as identity } from "../server-entry.mjs";
const consumables = base({
  top_level_table: "consumables",
  baseQuery: (trx, opts) => trx.selectFrom("consumables").where("id", "not in", trx.selectFrom("medication_doses").select("id").distinct()).select(["consumables.id", "consumables.name"]).$if(!!opts.search, (qb) => qb.where("consumables.name", "ilike", `%${opts.search}%`)),
  formatResult: identity
});
export {
  consumables as c
};
