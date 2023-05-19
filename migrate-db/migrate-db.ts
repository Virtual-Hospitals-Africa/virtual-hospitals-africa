import { Migrator } from "kysely";
import db from "../external-clients/db.ts";
import * as _20230126000000_add_patients_table from "./migrations/20230126000000_add_patients_table.ts";
import * as _20230127024002_add_whatsapp_conversation_tables from "./migrations/20230127024002_add_whatsapp_conversation_tables.ts";
import * as _20230127203321_add_doctors_appointments from "./migrations/20230127203321_add_doctors_appointments.ts";
import * as _20230316155657_add_doctor_google_tokens from "./migrations/20230316155657_add_doctor_google_tokens.ts";
import * as _20230517124053_add_update_trigger from "./migrations/20230517124053_add_update_trigger.ts";
import * as _20230518122050_add_appointment_status from "./migrations/20230518122050_add_appointment_status.ts";


async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: {
      getMigrations() {
        return Promise.resolve({
          _20230126000000_add_patients_table,
          _20230127024002_add_whatsapp_conversation_tables,
          _20230127203321_add_doctors_appointments,
          _20230316155657_add_doctor_google_tokens,
          _20230517124053_add_update_trigger,
          _20230518122050_add_appointment_status,
        });
      },
    },
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    throw error;
  }

  await db.destroy();
}

migrateToLatest();
