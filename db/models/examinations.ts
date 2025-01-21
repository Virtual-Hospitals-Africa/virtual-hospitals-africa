import { sql } from 'kysely'
import { literalBoolean } from '../helpers.ts'
import { RenderedPatientExamination, TrxOrDb } from '../../types.ts'
import { literalString } from '../helpers.ts'
import { EncounterStep } from '../../db.d.ts'

export function forPatientEncounter(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    encounter_id: string
    encounter_step?: EncounterStep
  },
): Promise<RenderedPatientExamination[]> {
  return trx.selectFrom('examinations')
    .leftJoin(
      'patient_examinations',
      (join) =>
        join.on('patient_examinations.encounter_id', '=', opts.encounter_id)
          .onRef(
            'patient_examinations.examination_identifier',
            '=',
            'examinations.identifier',
          ),
    )
    .select([
      'patient_examinations.id as patient_examination_id',
      'patient_examinations.completed',
      'patient_examinations.skipped',
      'patient_examinations.ordered',
      'examinations.identifier as examination_identifier',
      'examinations.path',
      'examinations.encounter_step',
      'examinations.query_slug',
      'examinations.display_name',
      sql<
        string
      >`'/app/patients/' || ${opts.patient_id} || '/encounters/' || ${opts.encounter_id} || examinations.path`
        .as('href'),
    ])
    .$if(
      !!opts.encounter_step,
      (qb) =>
        qb.where('examinations.encounter_step', '=', opts.encounter_step!),
    )
    .orderBy('examinations.order', 'asc')
    .execute()
}

export async function add(
  trx: TrxOrDb,
  { examinations, encounter_id, patient_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    examinations: {
      during_this_encounter: string[]
      orders: string[]
    }
  },
) {
  const all_examinations = [
    ...examinations.during_this_encounter,
    ...examinations.orders,
  ]

  let delete_query = trx
    .deleteFrom('patient_examinations')
    .where('encounter_id', '=', encounter_id)
    .where('patient_id', '=', patient_id)

  if (all_examinations.length > 0) {
    delete_query = delete_query.where(
      'examination_identifier',
      'not in',
      all_examinations,
    )
  }

  const deleting_examination_not_specified = delete_query.execute()

  all_examinations.length && await trx
    .insertInto('patient_examinations')
    .columns([
      'examination_identifier',
      'patient_id',
      'encounter_id',
      'encounter_provider_id',
      'ordered',
    ])
    .expression((eb) => {
      // examinations requiring insert are those not already present
      const base_insert = eb.selectFrom('examinations')
        .leftJoin('patient_examinations', (join) =>
          join.onRef(
            'patient_examinations.examination_identifier',
            '=',
            'examinations.identifier',
          )
            .on('patient_examinations.encounter_id', '=', encounter_id)
            .on('patient_examinations.patient_id', '=', patient_id))
        .where('patient_examinations.id', 'is', null)
        .select([
          'examinations.identifier as examination_identifier',
          literalString(patient_id).as('patient_id'),
          literalString(encounter_id).as('encounter_id'),
          literalString(encounter_provider_id).as('encounter_provider_id'),
        ])

      const during_this_encounter = base_insert
        .where(
          'examinations.identifier',
          'in',
          examinations.during_this_encounter,
        )
        .select(literalBoolean(false).as('ordered'))

      const orders = base_insert
        .where('examinations.identifier', 'in', examinations.orders)
        .select(literalBoolean(true).as('ordered'))

      if (!examinations.during_this_encounter.length) return orders
      if (!examinations.orders.length) return during_this_encounter
      return during_this_encounter.unionAll(orders)
    })
    .returning('id')
    .execute()

  await deleting_examination_not_specified
}

export function skip(trx: TrxOrDb, values: {
  examination_identifier: string
  patient_id: string
  encounter_id: string
  encounter_provider_id: string
}) {
  return trx
    .insertInto('patient_examinations')
    .values({
      ...values,
      skipped: true,
    })
    .executeTakeFirstOrThrow()
}
