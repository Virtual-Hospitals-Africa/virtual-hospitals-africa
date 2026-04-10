import { aU as base, dd as jsonArrayFromColumn } from "../server-entry.mjs";
const devices = base({
  top_level_table: "devices",
  baseQuery: (trx, opts) => trx.selectFrom("devices").select((eb) => ["devices.id", "devices.name", "devices.manufacturer", jsonArrayFromColumn("diagnostic_test", eb.selectFrom("device_capabilities").whereRef("device_capabilities.device_id", "=", "devices.id").select("diagnostic_test")).as("diagnostic_test_capabilities")]).$if(!!opts.search, (qb) => {
    const devices_with_capability = trx.selectFrom("device_capabilities").where("device_capabilities.diagnostic_test", "ilike", `%${opts.search}%`).select("device_capabilities.device_id").distinct();
    return qb.where((eb) => eb.or([eb("devices.name", "ilike", `%${opts.search}%`), eb("devices.manufacturer", "ilike", `%${opts.search}%`), eb("devices.id", "in", devices_with_capability)]));
  }),
  formatResult: (x) => x
});
export {
  devices as d
};
