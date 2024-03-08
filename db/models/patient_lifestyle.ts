import { sql } from 'kysely'
import { Lifestyle, TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'
import { PatientLifestyle } from '../../db.d.ts'

export function upsert(
  trx: TrxOrDb,
  patient_id: number,
  lifestyle: {
    [
      k in keyof Omit<
        PatientLifestyle,
        'id' | 'created_at' | 'updated_at' | 'patient_id'
      >
      // deno-lint-ignore no-explicit-any
    ]: any
  },
) {
  const to_upsert = {
    ...lifestyle,
    patient_id,
  }

  const query = trx
    .insertInto('patient_lifestyle')
    .values(to_upsert)
    .onConflict((oc) => oc.column('patient_id').doUpdateSet(to_upsert))
    .returningAll()

  return query.executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: number },
): Promise<Lifestyle | undefined> {
  const patient_lifestyle = await trx
    .selectFrom('patient_lifestyle')
    .where('patient_id', '=', patient_id)
    .select(
      jsonBuildObject({
        sexual_activity: sql<
          Lifestyle['sexual_activity']
        >`TO_JSON(sexual_activity)`,
        alcohol: sql<Lifestyle['alcohol']>`TO_JSON(alcohol)`,
        smoking: sql<Lifestyle['smoking']>`TO_JSON(smoking)`,
      }).as('lifestyle'),
    )
    .executeTakeFirst()
  return patient_lifestyle?.lifestyle
}
