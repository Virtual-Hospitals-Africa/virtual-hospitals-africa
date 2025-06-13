import { Kysely } from 'kysely'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .createType('encounter_reason')
    .asEnum(ENCOUNTER_REASONS)
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropType('encounter_reason').execute()
}
