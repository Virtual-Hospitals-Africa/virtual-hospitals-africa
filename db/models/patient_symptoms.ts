import { sql } from 'kysely'
import {
  PatientSymptomUpsert,
  RenderedPatientSymptom,
  TrxOrDb,
} from '../../types.ts'
import { isoDate, jsonArrayFrom } from '../helpers.ts'
import omit from '../../util/omit.ts'
import { tree } from './icd10.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export async function upsert(
  trx: TrxOrDb,
  { symptoms, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    symptoms: PatientSymptomUpsert[]
  },
) {
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
    .select('media_id')

  const removing_media = trx.deleteFrom('media')
    .where('media.id', 'in', patient_symptom_media_to_remove)
    .execute()

  const removing_symptoms = trx.deleteFrom('patient_symptoms')
    .where('patient_symptoms.patient_id', '=', patient_id)
    .where('patient_symptoms.encounter_id', '=', encounter_id)
    .execute()

  const to_insert = symptoms.map((s) => ({
    ...omit(s, ['media']),
    patient_id,
    encounter_id,
    encounter_provider_id,
  }))

  const getting_results = !to_insert.length ? Promise.resolve([]) : trx
    .insertInto('patient_symptoms')
    .values(to_insert)
    .returning('id')
    .execute()

  const { results } = await promiseProps({
    removing_media,
    removing_symptoms,
    results: getting_results,
  })

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
