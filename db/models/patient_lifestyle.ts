import { sql } from 'kysely'
import { Lifestyle, TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'
import { PatientLifestyle } from '../../db.d.ts'

export function upsert(
  trx: TrxOrDb,
  patient_id: string,
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
  { patient_id }: { patient_id: string },
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
        substance_use: sql<Lifestyle['substance_use']>`TO_JSON(substance_use)`,
        exercise: sql<Lifestyle['exercise']>`TO_JSON(exercise)`,
        diet: sql<Lifestyle['diet']>`TO_JSON(diet)`,
      }).as('lifestyle'),
    )
    .executeTakeFirst()
  return patient_lifestyle?.lifestyle
}
