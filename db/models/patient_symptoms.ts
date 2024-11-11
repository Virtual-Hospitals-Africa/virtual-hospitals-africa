import { DeleteResult, sql } from 'kysely'
import {
  PatientSymptomUpsert,
  RenderedPatientSymptom,
  TrxOrDb,
} from '../../types.ts'
import { isoDate, jsonArrayFrom } from '../helpers.ts'
import omit from '../../util/omit.ts'
import { tree } from './icd10.ts'
import generateUUID from '../../util/uuid.ts'

export async function upsert(
  trx: TrxOrDb,
  { symptoms, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    symptoms: PatientSymptomUpsert[]
  },
) {

  const symptoms_with_edited_media = symptoms.filter(s => s.media_edited)

  const {removing_media, removing_symptoms} = await deletePatientSymptomsMedia(trx, {
    patient_id,
    encounter_id,
    symptoms: symptoms_with_edited_media
  })

  const results = await upsertPatientSymptoms(trx, {
    symptoms,
    patient_id,
    encounter_id,
    encounter_provider_id,
  })

  const inserted_ids = results.map(s => s.id)

  let query = trx.deleteFrom('patient_symptoms')
    .where('patient_id', '=', patient_id)
    .where('encounter_id', '=', encounter_id)
    .where('encounter_provider_id', '=', encounter_provider_id)

    if (inserted_ids) {
      query = query
        .where('id', 'not in', inserted_ids)
    }

    await query.execute()

  const patient_symptom_media_to_insert = symptoms.flatMap(
    ({ media }, index) => {
      if (!media?.length) return []
      return media.map(({ id }) => ({
        patient_symptom_id: results[index].id,
        media_id: id,
      }))
    },
  )

  if (patient_symptom_media_to_insert.length) {
    await trx
      .insertInto('patient_symptom_media')
      .values(patient_symptom_media_to_insert)
      .execute()
  }

  await removing_symptoms
  await removing_media
  return results
}

function deletePatientSymptomsMedia(
  trx: TrxOrDb,
  { patient_id, encounter_id, symptoms }: {
    patient_id: string
    encounter_id: string
    symptoms: PatientSymptomUpsert[]
  },
) {

  const symptom_codes_to_remove = symptoms
    .filter((s) => s.media_edited)
    .map((s) => s.code)

  let removing_media = Promise.resolve<Array<DeleteResult>>([])
  let removing_symptoms = Promise.resolve<Array<DeleteResult>>([])

  if (symptom_codes_to_remove.length != 0) {
    const patient_symptom_media_to_remove = trx.selectFrom(
      'patient_symptom_media',
    )
    .innerJoin(
      'patient_symptoms',
      'patient_symptoms.id',
      'patient_symptom_media.patient_symptom_id',
    )
    .where('patient_symptoms.patient_id', '=', patient_id)
    .where('patient_symptoms.encounter_id', '=', encounter_id)
    .where('patient_symptoms.code', 'in', symptom_codes_to_remove)
    .select('media_id')

    removing_media = trx.deleteFrom('media')
      .where('media.id', 'in', patient_symptom_media_to_remove)
      .execute()

    removing_symptoms = trx.deleteFrom('patient_symptoms')
      .where('patient_symptoms.patient_id', '=', patient_id)
      .where('patient_symptoms.encounter_id', '=', encounter_id)
      .where('patient_symptoms.code', 'in', symptom_codes_to_remove)
      .execute()
  }

  return {removing_media, removing_symptoms}
}

function upsertPatientSymptoms(
  trx: TrxOrDb,
  {symptoms, patient_id, encounter_id, encounter_provider_id}: {
    symptoms: PatientSymptomUpsert[],
    patient_id: string,
    encounter_id: string,
    encounter_provider_id: string},
) {
  return Promise.all(symptoms.map((s) => {
    const to_insert = {
      ...omit(s, ['media', 'media_edited', 'patient_symptom_id']),
      id: s.patient_symptom_id || generateUUID(),
      patient_id,
      encounter_id,
      encounter_provider_id,
    }

    return trx.insertInto('patient_symptoms')
      .values(to_insert)
      .onConflict((oc) => oc
        .column('id')
        .doUpdateSet(to_insert))
      .returningAll()
      .executeTakeFirstOrThrow()
  }))
}

export function getEncounter(
  trx: TrxOrDb,
  { patient_id, encounter_id }: {
    patient_id: string
    encounter_id: string | 'open'
  },
): Promise<RenderedPatientSymptom[]> {
  let query = tree(trx)
    .selectFrom('icd10_diagnoses_tree')
    .innerJoin(
      'patient_symptoms',
      'patient_symptoms.code',
      'icd10_diagnoses_tree.code',
    )
    .where('patient_symptoms.patient_id', '=', patient_id)
    .selectAll('icd10_diagnoses_tree')
    .select((eb) => [
      'patient_symptoms.id as patient_symptom_id',
      'severity',
      'notes',
      isoDate(eb.ref('start_date')).as('start_date'),
      isoDate(eb.ref('end_date')).as('end_date'),
      jsonArrayFrom(
        eb
          .selectFrom('patient_symptom_media')
          .innerJoin('media', 'media.id', 'patient_symptom_media.media_id')
          .select([
            'media.mime_type',
            sql<string>`concat('/app/media/', media.uuid)`.as('url'),
          ])
          .whereRef(
            'patient_symptom_media.patient_symptom_id',
            '=',
            'patient_symptoms.id',
          ),
      ).as('media'),
    ])

  // TODO: abstract this out into patient_encounters model
  if (encounter_id !== 'open') {
    query = query.where('patient_symptoms.encounter_id', '=', encounter_id)
  } else {
    query = query.innerJoin(
      'patient_encounters',
      'patient_encounters.id',
      'patient_symptoms.encounter_id',
    )
      .where('patient_encounters.patient_id', '=', patient_id)
      .where('patient_encounters.closed_at', 'is', null)
  }

  return query.execute()
}
