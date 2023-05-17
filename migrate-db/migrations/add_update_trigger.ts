import { createUpdateTimeTrigger, dropUpdateTimeTrigger } from "../../external-clients/db.ts";
import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {
  return createUpdateTimeTrigger()
}

export async function down(db: Kysely<unknown>) {
  await dropUpdateTimeTrigger();
}