import { aI as sql, m as assert, d8 as literalString, d9 as literalNumber, da as literalOptionalDate, bf as jsonArrayFrom, aV as jsonObjectFrom, aG as jsonBuildObject, db as longFormattedDateTime, dc as longFormattedDate, au as employees, dd as jsonArrayFromColumn } from "../server-entry.mjs";
const inventory = {
  getDevices(trx, opts) {
    return trx.selectFrom("organization_devices").innerJoin("devices", "organization_devices.device_id", "devices.id").where("organization_devices.organization_id", "=", opts.organization_id).select((eb) => ["devices.id as device_id", "organization_devices.serial_number", "devices.name", "devices.manufacturer", jsonArrayFromColumn("diagnostic_test", eb.selectFrom("device_capabilities").whereRef("device_capabilities.device_id", "=", "devices.id").select("diagnostic_test")).as("diagnostic_test_capabilities")]).execute();
  },
  getConsumables(trx, opts) {
    return trx.selectFrom("organization_consumables").innerJoin("consumables", "organization_consumables.consumable_id", "consumables.id").leftJoin("medication_doses", "consumables.id", "medication_doses.id").where("organization_consumables.organization_id", "=", opts.organization_id).where("medication_doses.id", "is", null).select(["consumables.name as name", "consumables.id as consumable_id", "quantity_on_hand as quantity_on_hand", jsonBuildObject({
      add: sql`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/add_consumable?consumable_id=', consumables.id::text)
        `,
      history: sql`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `
    }).as("actions")]).execute();
  },
  // TODO: update return type to match RenderedOrganizationMedication or create dedicated type
  getMedicines(trx, opts) {
    return trx.selectFrom("organization_consumables").innerJoin("consumables", "organization_consumables.consumable_id", "consumables.id").innerJoin("medication_doses", "medication_doses.id", "consumables.id").innerJoin("medications", "medication_doses.medication_id", "medications.id").where("organization_consumables.organization_id", "=", opts.organization_id).select(["consumables.name", "medications.applicant_name", "medications.form", "medications.trade_name", "consumables.id as consumable_id", "quantity_on_hand", sql`COALESCE((
          SELECT string_agg(md.value::text || ' ' || md.description, '; ')
          FROM medication_doses md
          WHERE md.medication_id = medications.id
        ), '')`.as("strength_display"), jsonBuildObject({
      add: sql`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/add_medicine?medication_id=', medications.id::text)
        `,
      history: sql`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `
    }).as("actions")]).execute();
  },
  consumptionQuery(trx, opts) {
    return trx.selectFrom("consumption").innerJoin("employment", "consumption.created_by", "employment.id").innerJoin("procurement", "procurement.id", "consumption.procurement_id").innerJoin("health_workers", "health_workers.id", "employment.health_worker_id").select((eb) => ["procurement.id as procurement_id", sql`'consumption'`.as("interaction"), jsonObjectFrom(employees.baseQuery(trx, {}).where("employment.id", "=", eb.ref("consumption.created_by"))).$notNull().as("created_by"), sql`NULL`.as("procured_from"), sql`0 - consumption.quantity`.as("change"), "consumption.created_at", longFormattedDateTime("consumption.created_at").as("created_at_formatted"), sql`NULL`.as("expiry_date"), "procurement.batch_number", sql`NULL`.as("patient"), sql`NULL`.as("actions")]).where("consumption.organization_id", "=", opts.organization_id);
  },
  procurementQuery(trx, opts) {
    return trx.selectFrom("procurement").innerJoin("employment", "procurement.created_by", "employment.id").innerJoin("health_workers", "health_workers.id", "employment.health_worker_id").innerJoin("procurers", "procurement.procured_from", "procurers.id").select((eb) => ["procurement.id as procurement_id", sql`'procurement'`.as("interaction"), jsonObjectFrom(employees.baseQuery(trx, {}).where("employment.id", "=", eb.ref("procurement.created_by"))).$notNull().as("created_by"), jsonBuildObject({
      id: eb.ref("procurers.id"),
      name: eb.ref("procurers.name")
    }).as("procured_from"), eb.ref("procurement.quantity").as("change"), "procurement.created_at", longFormattedDateTime("procurement.created_at").as("created_at_formatted"), longFormattedDate("procurement.expiry_date").as("expiry_date"), "procurement.batch_number", sql`NULL`.as("patient"), jsonBuildObject({
      reorder: sql.raw(`'TODO'`)
    }).as("actions")]).where("procurement.organization_id", "=", opts.organization_id);
  },
  getConsumablesHistoryQuery(trx, {
    organization_id,
    consumable_id
  }) {
    const consumption = inventory.consumptionQuery(trx, {
      organization_id
    }).where("procurement.consumable_id", "=", consumable_id);
    const procurement = inventory.procurementQuery(trx, {
      organization_id
    }).where("procurement.consumable_id", "=", consumable_id);
    return consumption.unionAll(procurement).orderBy("created_at", "desc");
  },
  getConsumablesHistory(trx, opts) {
    const history = inventory.getConsumablesHistoryQuery(trx, opts);
    return trx.selectFrom("consumables").select(["consumables.name", jsonArrayFrom(history).as("history")]).where("consumables.id", "=", opts.consumable_id).executeTakeFirstOrThrow();
  },
  getLatestProcurement(trx, {
    organization_id,
    medication_id
  }) {
    return inventory.procurementQuery(trx, {
      organization_id
    }).innerJoin("medication_doses", "procurement.consumable_id", "medication_doses.id").where("medication_doses.medication_id", "=", medication_id).select(["procurement.quantity", "procurement.container_size", "procurement.number_of_containers"]).orderBy("procurement.created_at", "desc").executeTakeFirst();
  },
  getAvailableTests(trx, opts) {
    return trx.selectFrom("organization_devices").innerJoin("devices", "organization_devices.device_id", "devices.id").innerJoin("device_capabilities", "devices.id", "device_capabilities.device_id").where("organization_devices.organization_id", "=", opts.organization_id).select("device_capabilities.diagnostic_test").distinct().execute();
  },
  addOrganizationDevice(trx, model) {
    return trx.insertInto("organization_devices").values(model).returning("id").executeTakeFirstOrThrow();
  },
  async addOrganizationMedicine(trx, organization_id, medicine) {
    const procured_from = medicine.procured_from_id ? {
      id: medicine.procured_from_id
    } : (assert(medicine.procured_from_name), await trx.insertInto("procurers").values({
      name: medicine.procured_from_name
    }).returning("id").executeTakeFirstOrThrow());
    const {
      consumable_id
    } = await trx.insertInto("procurement").columns(["consumable_id", "created_by", "organization_id", "quantity", "number_of_containers", "container_size", "procured_from", "expiry_date", "batch_number"]).expression((eb) => (
      // Find the consumable for this medication (via medication_doses)
      eb.selectFrom("medication_doses").where("medication_doses.medication_id", "=", medicine.medication_id).select(["medication_doses.id as consumable_id", literalString(medicine.created_by).as("created_by"), literalString(organization_id).as("organization_id"), literalNumber(medicine.quantity).as("quantity"), literalNumber(medicine.number_of_containers).as("number_of_containers"), literalNumber(medicine.container_size).as("container_size"), literalString(procured_from.id).as("procured_from"), literalOptionalDate(medicine.expiry_date).as("expiry_date"), sql.lit(medicine.batch_number).as("batch_number")]).limit(1)
    )).returning("consumable_id").executeTakeFirstOrThrow();
    await trx.insertInto("organization_consumables").values({
      consumable_id,
      organization_id,
      quantity_on_hand: medicine.quantity
    }).onConflict((oc) => oc.constraint("organization_consumable").doUpdateSet({
      quantity_on_hand: sql`organization_consumables.quantity_on_hand + ${medicine.quantity}`
    })).executeTakeFirstOrThrow();
  },
  async procureConsumable(trx, organization_id, consumable) {
    const updating_quantity_on_hand = await trx.insertInto("organization_consumables").values({
      organization_id,
      consumable_id: consumable.consumable_id,
      quantity_on_hand: consumable.quantity
    }).onConflict((oc) => oc.constraint("organization_consumable").doUpdateSet({
      quantity_on_hand: sql`organization_consumables.quantity_on_hand + ${consumable.quantity}`
    })).executeTakeFirstOrThrow();
    const procured_from = consumable.procured_from_id ? {
      id: consumable.procured_from_id
    } : (assert(consumable.procured_from_name, "procured_from_name is required"), await trx.insertInto("procurers").values({
      name: consumable.procured_from_name
    }).returning("id").executeTakeFirstOrThrow());
    const procured = await trx.insertInto("procurement").values({
      organization_id,
      consumable_id: consumable.consumable_id,
      created_by: consumable.created_by,
      quantity: consumable.quantity,
      procured_from: procured_from.id,
      expiry_date: consumable.expiry_date,
      batch_number: consumable.batch_number,
      container_size: consumable.container_size,
      number_of_containers: consumable.number_of_containers
    }).returning("id").executeTakeFirstOrThrow();
    await updating_quantity_on_hand;
    return procured;
  },
  consumeConsumable(trx, organization_id, consumable) {
    return trx.with("adding_consumption", (qb) => qb.insertInto("consumption").values({
      organization_id,
      created_by: consumable.created_by,
      quantity: consumable.quantity,
      procurement_id: consumable.procurement_id
    }).returning("id")).with("incrementing_consumed_amount", (qb) => qb.updateTable("procurement").set({
      consumed_amount: sql`consumed_amount + ${consumable.quantity}`
    }).where("procurement.id", "=", consumable.procurement_id)).with("decrementing_quantity_on_hand", (qb) => qb.updateTable("organization_consumables").set({
      quantity_on_hand: sql`quantity_on_hand - ${consumable.quantity}`
    }).where("organization_consumables.organization_id", "=", organization_id).where("organization_consumables.consumable_id", "=", consumable.consumable_id)).selectFrom("adding_consumption").selectAll().executeTakeFirstOrThrow();
  },
  upsertProcurer(trx, procurer) {
    return trx.insertInto("procurers").values(procurer).onConflict((c) => c.column("id").doUpdateSet(procurer)).execute();
  }
};
export {
  inventory as i
};
