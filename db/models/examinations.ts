import { sql } from 'kysely'
import { upsertOne } from '../helpers.ts'
import { RenderedPatientExamination, TrxOrDb } from '../../types.ts'

export function forPatientEncounter(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    organization_id: string
    patient_encounter_id: string
    consultation_step?: string
  },
): Promise<RenderedPatientExamination[]> {
  return trx
    .selectFrom('patients')
    .innerJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .innerJoin(
      'patient_encounters',
      (join) =>
        join.onRef('patient_encounters.patient_id', '=', 'patients.id')
          .on('patient_encounters.id', '=', opts.patient_encounter_id),
    )
    .innerJoin('examinations', (join) => join.onTrue())
    .leftJoin(
      'patient_examinations',
      (join) =>
        join.onRef(
          'patient_examinations.patient_encounter_id',
          '=',
          'patient_encounters.id',
        )
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
      'examinations.consultation_step',
      'examinations.slug',
      'examinations.display_name',
      sql<
        string
      >`'/app/organizations/' || ${opts.organization_id} || '/patients/' || ${opts.patient_id} || '/open_encounter/consultation/' || examinations.path`
        .as('href'),
    ])
    .where('patients.id', '=', opts.patient_id)
    .where((eb) =>
      eb.or([
        eb('patient_examinations.id', 'is not', null),
        eb('examinations.identifier', '=', 'head_to_toe_assessment_general'),
        eb('examinations.identifier', '=', 'head_to_toe_assessment_skin'),
        eb(
          'examinations.identifier',
          '=',
          'head_to_toe_assessment_head_and_neck',
        ),
        eb(
          'examinations.identifier',
          '=',
          'head_to_toe_assessment_cardiovascular',
        ),
        eb(
          'examinations.identifier',
          '=',
          'head_to_toe_assessment_respiratory',
        ),
        eb(
          'examinations.identifier',
          '=',
          'head_to_toe_assessment_gastrointestinal',
        ),
        eb(
          'examinations.identifier',
          '=',
          'head_to_toe_assessment_neuromuscular',
        ),
        eb.and([
          eb('patients.gender', '=', 'female'),
          eb(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18),
          eb('examinations.identifier', '=', 'womens_health_assessment'),
        ]),
        eb.and([
          eb('patients.gender', '=', 'male'),
          eb(sql.ref('patient_age.age_years').$castTo<number>(), '>=', 18),
          eb('examinations.identifier', '=', 'mens_health_assessment'),
        ]),
        eb.and([
          eb(sql.ref('patient_age.age_years').$castTo<number>(), '<', 18),
          eb('examinations.identifier', '=', 'child_health_assessment'),
        ]),
        eb.and([
          eb('patient_encounters.reason', '=', 'maternity'),
          eb('examinations.identifier', '=', 'maternity_assessment'),
        ]),
        eb(
          'examinations.consultation_step',
          '=',
          'history',
        ),
      ])
    )
    .$if(
      !!opts.consultation_step,
      (qb) =>
        qb.where(
          'examinations.consultation_step',
          '=',
          opts.consultation_step!,
        ),
    )
    .orderBy('examinations.order', 'asc')
    .execute()
}

export function allForStep(
  trx: TrxOrDb,
  opts: {
    consultation_step: string
  },
) {
  return trx
    .selectFrom('examinations')
    .selectAll('examinations')
    .where('consultation_step', '=', opts.consultation_step)
    .orderBy('examinations.order', 'asc')
    .execute()
}

// export async function add(
//   trx: TrxOrDb,
//   { examinations, patient_encounter_id, patient_id, patient_encounter_employee_id }: {
//     patient_id: string
//     patient_encounter_id: string
//     patient_encounter_employee_id: string
//     examinations: {
//       during_this_encounter: string[]
//       orders: string[]
//     }
//   },
// ) {
//   const all_examinations = [
//     ...examinations.during_this_encounter,
//     ...examinations.orders,
//   ]

//   let delete_query = trx
//     .deleteFrom('patient_examinations')
//     .where('patient_encounter_id', '=', patient_encounter_id)
//     .where('patient_id', '=', patient_id)

//   if (all_examinations.length > 0) {
//     delete_query = delete_query.where(
//       'examination_identifier',
//       'not in',
//       all_examinations,
//     )
//   }

//   const deleting_examination_not_specified = delete_query.execute()

//   all_examinations.length && await trx
//     .insertInto('patient_examinations')
//     .columns([
//       'examination_identifier',
//       'patient_id',
//       'patient_encounter_id',
//       'patient_encounter_employee_id',
//       'ordered',
//     ])
//     .expression((eb) => {
//       // examinations requiring insert are those not already present
//       const base_insert = eb.selectFrom('examinations')
//         .leftJoin('patient_examinations', (join) =>
//           join.onRef(
//             'patient_examinations.examination_identifier',
//             '=',
//             'examinations.identifier',
//           )
//             .on('patient_examinations.patient_encounter_id', '=', patient_encounter_id)
//             .on('patient_examinations.patient_id', '=', patient_id))
//         .where('patient_examinations.id', 'is', null)
//         .select([
//           'examinations.identifier as examination_identifier',
//           literalString(patient_id).as('patient_id'),
//           literalString(patient_encounter_id).as('patient_encounter_id'),
//           literalString(patient_encounter_employee_id).as('patient_encounter_employee_id'),
//         ])

//       const during_this_encounter = base_insert
//         .where(
//           'examinations.identifier',
//           'in',
//           examinations.during_this_encounter,
//         )
//         .select(literalBoolean(false).as('ordered'))

//       const orders = base_insert
//         .where('examinations.identifier', 'in', examinations.orders)
//         .select(literalBoolean(true).as('ordered'))

//       if (!examinations.during_this_encounter.length) return orders
//       if (!examinations.orders.length) return during_this_encounter
//       return during_this_encounter.unionAll(orders)
//     })
//     .returning('id')
//     .execute()

//   await deleting_examination_not_specified
// }

// export function skip(trx: TrxOrDb, values: {
//   examination_identifier: string
//   patient_id: string
//   patient_encounter_id: string
//   patient_encounter_employee_id: string
// }) {
//   return trx
//     .insertInto('patient_examinations')
//     .values({
//       ...values,
//       skipped: true,
//     })
//     .executeTakeFirstOrThrow()
// }

export function upsert(trx: TrxOrDb, upsert: {
  id?: string
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  examination_identifier: string
  completed?: boolean
}) {
  return upsertOne(trx, 'patient_examinations', upsert)
}

export async function createCompletedIfNoneExists(trx: TrxOrDb, exam_details: {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  examination_identifier: string
}) {
  const exam = await trx.updateTable('patient_examinations')
    .set({ completed: true })
    .where('patient_id', '=', exam_details.patient_id)
    .where('patient_encounter_id', '=', exam_details.patient_encounter_id)
    .where(
      'patient_encounter_employee_id',
      '=',
      exam_details.patient_encounter_employee_id,
    )
    .where('examination_identifier', '=', exam_details.examination_identifier)
    .returning('id')
    .executeTakeFirst()

  return exam || upsert(trx, { ...exam_details, completed: true })
}

export async function createIncompleteIfNoneExists(
  trx: TrxOrDb,
  { examination_identifiers, ...rest }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    examination_identifiers: string[]
  },
) {
  for (const examination_identifier of examination_identifiers) {
    await trx.insertInto('patient_examinations')
      .values({
        ...rest,
        examination_identifier,
      })
      .onConflict((oc) => oc.doNothing())
      .execute()
  }
}
