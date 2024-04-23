import { describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as examinations from '../../db/models/examinations.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestFacility,
} from '../web/utilities.ts'

describe(
  'db/models/examinations.ts',
  { sanitizeResources: false },
  () => {
    describe('recommended', () => {
      itUsesTrxAnd(
        'returns the recommended examinations for an adult woman',
        (trx) =>
          withTestFacility(trx, async (organization_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Woman',
              gender: 'female',
              date_of_birth: '1990-01-01',
            })
            const patient_encounter = await patient_encounters.upsert(
              trx,
              organization_id,
              {
                patient_id: patient.id,
                reason: 'seeking treatment',
              },
            )

            const recommended = await examinations.recommended(trx)
              .selectFrom('recommended_examinations')
              .select('examination_name')
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

            assertEquals(recommended, [
              { examination_name: 'Head-to-toe Assessment' },
              { examination_name: "Women's Health Assessment" },
            ])
          }),
      )

      itUsesTrxAnd(
        'returns the recommended examinations for a maternity visit',
        (trx) =>
          withTestFacility(trx, async (organization_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Woman',
              gender: 'female',
              date_of_birth: '1990-01-01',
            })
            const patient_encounter = await patient_encounters.upsert(
              trx,
              organization_id,
              {
                patient_id: patient.id,
                reason: 'maternity',
              },
            )

            const recommended = await examinations.recommended(trx)
              .selectFrom('recommended_examinations')
              .select('examination_name')
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

            assertEquals(recommended, [
              { examination_name: 'Head-to-toe Assessment' },
              { examination_name: "Women's Health Assessment" },
              { examination_name: 'Maternity Assessment' },
            ])
          }),
      )
    })

    describe('forPatientEncounter', () => {
      itUsesTrxAnd(
        'returns the completed, skipped, and recommended examinations for a patient encounter',
        (trx) =>
          withTestFacility(trx, async (organization_id) => {
            const health_worker = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })
            const patient = await patients.upsert(trx, {
              name: 'Test Woman',
              gender: 'female',
              date_of_birth: '1990-01-01',
            })
            const patient_encounter = await patient_encounters.upsert(
              trx,
              organization_id,
              {
                patient_id: patient.id,
                reason: 'seeking treatment',
                provider_ids: [
                  health_worker.employee_id!,
                ],
              },
            )

            await examinations.upsertFindings(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
              encounter_provider_id:
                patient_encounter.providers[0].encounter_provider_id,
              examination_name: 'Dental',
              values: {},
            })

            const for_patient_encounter = await examinations
              .forPatientEncounter(trx)
              .selectFrom('patient_examinations_with_recommendations')
              .select([
                'examination_name',
                'completed',
                'skipped',
                'recommended',
              ])
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

            assertEquals(for_patient_encounter, [
              {
                examination_name: 'Head-to-toe Assessment',
                completed: false,
                skipped: false,
                recommended: true,
              },
              {
                examination_name: "Women's Health Assessment",
                completed: false,
                skipped: false,
                recommended: true,
              },
              {
                examination_name: 'Dental',
                completed: true,
                skipped: false,
                recommended: false,
              },
            ])
          }),
      )
    })

    describe('upsertFindings', () => {
      itUsesTrxAnd(
        'upserts findings when no previous findings exist',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, {
            scenario: 'approved-nurse',
          })
          const patient = await patients.upsert(trx, { name: 'Test Patient' })
          const encounter = await patient_encounters.upsert(trx, '00000000-0000-0000-0000-000000000001', {
            patient_id: patient.id,
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          })

          await examinations.upsertFindings(trx, {
            patient_id: patient.id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_name: 'Head-to-toe Assessment',
            values: {
              'Patient state': {
                ill: true,
              },
            },
          })

          const patient_examination = await examinations.getPatientExamination(
            trx,
            {
              patient_id: patient.id,
              encounter_id: encounter.id,
              examination_name: 'Head-to-toe Assessment',
            },
          )

          assertEquals(patient_examination, {
            completed: true,
            skipped: false,
            categories: [
              {
                category: 'Patient state',
                findings: [
                  {
                    label: 'ill',
                    name: 'ill',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: true,
                  },
                  {
                    label: 'unalert',
                    name: 'unalert',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'confused',
                    name: 'confused',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'drowsy',
                    name: 'drowsy',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'febrile',
                    name: 'febrile',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dehydrated',
                    name: 'dehydrated',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'uncooperative',
                    name: 'uncooperative',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'sad',
                    name: 'sad',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'resentful',
                    name: 'resentful',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'fat',
                    name: 'fat',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'wasted',
                    name: 'wasted',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'in pain',
                    name: 'in pain',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'in distress',
                    name: 'in distress',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Hands',
                findings: [
                  {
                    label: 'cold hands',
                    name: 'cold hands',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'sweaty',
                    name: 'sweaty',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'clammy',
                    name: 'clammy',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'peripheral cyanosis',
                    name: 'peripheral cyanosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'nicotine stains',
                    name: 'nicotine stains',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Nails',
                findings: [
                  {
                    label: 'leukonychia',
                    name: 'leukonychia',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'koilonychia',
                    name: 'koilonychia',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'clubbing',
                    name: 'clubbing',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'splinter hemorrhages',
                    name: 'splinter hemorrhages',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'pitting',
                    name: 'pitting',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'onycholysis',
                    name: 'onycholysis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Palms',
                findings: [
                  {
                    label: 'erythema',
                    name: 'erythema',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'Dupuytren’s contracture',
                    name: 'Dupuytren’s contracture',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'Joints',
                    name: 'Joints',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'skin swelling',
                    name: 'skin swelling',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Colour',
                findings: [
                  {
                    label: 'jaundice',
                    name: 'jaundice',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'pale',
                    name: 'pale',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Texture',
                findings: [
                  {
                    label: 'thin',
                    name: 'thin',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'thick',
                    name: 'thick',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dry',
                    name: 'dry',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'rash',
                    name: 'rash',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Distribution',
                findings: [
                  {
                    label: 'hands and feet',
                    name: 'hands and feet',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'extensor surfaces',
                    name: 'extensor surfaces',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'flexural surfaces',
                    name: 'flexural surfaces',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'truncal',
                    name: 'truncal',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'exposed sites',
                    name: 'exposed sites',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'asymmetrical',
                    name: 'asymmetrical',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'discrete',
                    name: 'discrete',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'confluent',
                    name: 'confluent',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Pattern',
                findings: [
                  {
                    label: 'linear',
                    name: 'linear',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'annular/ring-like',
                    name: 'annular/ring-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'serpiginous/snake-like',
                    name: 'serpiginous/snake-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'reticular/net-like',
                    name: 'reticular/net-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'star shaped',
                    name: 'star shaped',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'flat macular',
                    name: 'flat macular',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'raised papular',
                    name: 'raised papular',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'localized plaque',
                    name: 'localized plaque',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'wheal',
                    name: 'wheal',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blisters',
                    name: 'blisters',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'bullae',
                    name: 'bullae',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'large vesicles',
                    name: 'large vesicles',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'nodules',
                    name: 'nodules',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'purpura',
                    name: 'purpura',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Surface',
                findings: [
                  {
                    label: 'scaly',
                    name: 'scaly',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'shiny',
                    name: 'shiny',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'well demarcated edges',
                    name: 'well demarcated edges',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'red pigment',
                    name: 'red pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'white pigment',
                    name: 'white pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blue pigment',
                    name: 'blue pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'brown pigment',
                    name: 'brown pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'black pigment',
                    name: 'black pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Character',
                findings: [
                  {
                    label: 'cold',
                    name: 'cold',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'tender',
                    name: 'tender',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blanching',
                    name: 'blanching',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'purpura character',
                    name: 'purpura character',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Tongue',
                findings: [
                  {
                    label: 'central cyanosis',
                    name: 'central cyanosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'moist',
                    name: 'moist',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dry tongue',
                    name: 'dry tongue',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Teeth',
                findings: [
                  {
                    label: 'caries',
                    name: 'caries',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'poor hygiene',
                    name: 'poor hygiene',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'false teeth',
                    name: 'false teeth',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Gums',
                findings: [
                  {
                    label: 'bleeding',
                    name: 'bleeding',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'swollen',
                    name: 'swollen',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Tonsils',
                findings: [
                  {
                    label: 'swelling',
                    name: 'swelling',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness tonsils',
                    name: 'redness tonsils',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'ulceration',
                    name: 'ulceration',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Pharynx',
                findings: [
                  {
                    label: 'swelling pharynx',
                    name: 'swelling pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness pharynx',
                    name: 'redness pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'ulceration pharynx',
                    name: 'ulceration pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Breath',
                findings: [
                  {
                    label: 'ketosis',
                    name: 'ketosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'alcohol',
                    name: 'alcohol',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'fetor',
                    name: 'fetor',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'musty',
                    name: 'musty',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Sclera',
                findings: [
                  {
                    label: 'icterus',
                    name: 'icterus',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Conjunctiva',
                findings: [
                  {
                    label: 'pale conjunctiva',
                    name: 'pale conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness conjunctiva',
                    name: 'redness conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'swelling conjunctiva',
                    name: 'swelling conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
            ],
          })
        },
      )

      itUsesTrxAnd(
        'handles updates and removing patient findings',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, {
            scenario: 'approved-nurse',
          })
          const patient = await patients.upsert(trx, { name: 'Test Patient' })
          const encounter = await patient_encounters.upsert(trx, '00000000-0000-0000-0000-000000000001', {
            patient_id: patient.id,
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          })

          await examinations.upsertFindings(trx, {
            patient_id: patient.id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_name: 'Head-to-toe Assessment',
            values: {
              'Patient state': {
                wasted: true,
              },
              'Palms': {
                erythema: true,
              },
            },
          })

          await examinations.upsertFindings(trx, {
            patient_id: patient.id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_name: 'Head-to-toe Assessment',
            values: {
              'Patient state': {
                wasted: true,
              },
              'Teeth': {
                caries: true,
              },
            },
          })

          const patient_examination = await examinations.getPatientExamination(
            trx,
            {
              patient_id: patient.id,
              encounter_id: encounter.id,
              examination_name: 'Head-to-toe Assessment',
            },
          )

          assertEquals(patient_examination, {
            completed: true,
            skipped: false,
            categories: [
              {
                category: 'Patient state',
                findings: [
                  {
                    label: 'ill',
                    name: 'ill',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'unalert',
                    name: 'unalert',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'confused',
                    name: 'confused',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'drowsy',
                    name: 'drowsy',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'febrile',
                    name: 'febrile',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dehydrated',
                    name: 'dehydrated',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'uncooperative',
                    name: 'uncooperative',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'sad',
                    name: 'sad',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'resentful',
                    name: 'resentful',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'fat',
                    name: 'fat',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'wasted',
                    name: 'wasted',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: true,
                  },
                  {
                    label: 'in pain',
                    name: 'in pain',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'in distress',
                    name: 'in distress',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Hands',
                findings: [
                  {
                    label: 'cold hands',
                    name: 'cold hands',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'sweaty',
                    name: 'sweaty',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'clammy',
                    name: 'clammy',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'peripheral cyanosis',
                    name: 'peripheral cyanosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'nicotine stains',
                    name: 'nicotine stains',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Nails',
                findings: [
                  {
                    label: 'leukonychia',
                    name: 'leukonychia',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'koilonychia',
                    name: 'koilonychia',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'clubbing',
                    name: 'clubbing',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'splinter hemorrhages',
                    name: 'splinter hemorrhages',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'pitting',
                    name: 'pitting',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'onycholysis',
                    name: 'onycholysis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Palms',
                findings: [
                  {
                    label: 'erythema',
                    name: 'erythema',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'Dupuytren’s contracture',
                    name: 'Dupuytren’s contracture',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'Joints',
                    name: 'Joints',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'skin swelling',
                    name: 'skin swelling',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Colour',
                findings: [
                  {
                    label: 'jaundice',
                    name: 'jaundice',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'pale',
                    name: 'pale',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Texture',
                findings: [
                  {
                    label: 'thin',
                    name: 'thin',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'thick',
                    name: 'thick',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dry',
                    name: 'dry',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'rash',
                    name: 'rash',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Distribution',
                findings: [
                  {
                    label: 'hands and feet',
                    name: 'hands and feet',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'extensor surfaces',
                    name: 'extensor surfaces',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'flexural surfaces',
                    name: 'flexural surfaces',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'truncal',
                    name: 'truncal',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'exposed sites',
                    name: 'exposed sites',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'asymmetrical',
                    name: 'asymmetrical',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'discrete',
                    name: 'discrete',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'confluent',
                    name: 'confluent',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Pattern',
                findings: [
                  {
                    label: 'linear',
                    name: 'linear',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'annular/ring-like',
                    name: 'annular/ring-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'serpiginous/snake-like',
                    name: 'serpiginous/snake-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'reticular/net-like',
                    name: 'reticular/net-like',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'star shaped',
                    name: 'star shaped',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'flat macular',
                    name: 'flat macular',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'raised papular',
                    name: 'raised papular',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'localized plaque',
                    name: 'localized plaque',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'wheal',
                    name: 'wheal',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blisters',
                    name: 'blisters',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'bullae',
                    name: 'bullae',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'large vesicles',
                    name: 'large vesicles',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'nodules',
                    name: 'nodules',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'purpura',
                    name: 'purpura',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Surface',
                findings: [
                  {
                    label: 'scaly',
                    name: 'scaly',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'shiny',
                    name: 'shiny',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'well demarcated edges',
                    name: 'well demarcated edges',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'red pigment',
                    name: 'red pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'white pigment',
                    name: 'white pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blue pigment',
                    name: 'blue pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'brown pigment',
                    name: 'brown pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'black pigment',
                    name: 'black pigment',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Character',
                findings: [
                  {
                    label: 'cold',
                    name: 'cold',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'tender',
                    name: 'tender',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'blanching',
                    name: 'blanching',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'purpura character',
                    name: 'purpura character',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Tongue',
                findings: [
                  {
                    label: 'central cyanosis',
                    name: 'central cyanosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'moist',
                    name: 'moist',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'dry tongue',
                    name: 'dry tongue',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Teeth',
                findings: [
                  {
                    label: 'caries',
                    name: 'caries',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: true,
                  },
                  {
                    label: 'poor hygiene',
                    name: 'poor hygiene',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'false teeth',
                    name: 'false teeth',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Gums',
                findings: [
                  {
                    label: 'bleeding',
                    name: 'bleeding',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'swollen',
                    name: 'swollen',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Tonsils',
                findings: [
                  {
                    label: 'swelling',
                    name: 'swelling',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness tonsils',
                    name: 'redness tonsils',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'ulceration',
                    name: 'ulceration',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Pharynx',
                findings: [
                  {
                    label: 'swelling pharynx',
                    name: 'swelling pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness pharynx',
                    name: 'redness pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'ulceration pharynx',
                    name: 'ulceration pharynx',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Breath',
                findings: [
                  {
                    label: 'ketosis',
                    name: 'ketosis',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'alcohol',
                    name: 'alcohol',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'fetor',
                    name: 'fetor',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'musty',
                    name: 'musty',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Sclera',
                findings: [
                  {
                    label: 'icterus',
                    name: 'icterus',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
              {
                category: 'Conjunctiva',
                findings: [
                  {
                    label: 'pale conjunctiva',
                    name: 'pale conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'redness conjunctiva',
                    name: 'redness conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                  {
                    label: 'swelling conjunctiva',
                    name: 'swelling conjunctiva',
                    options: null,
                    required: false,
                    type: 'boolean',
                    value: null,
                  },
                ],
              },
            ],
          })
        },
      )
    })
  },
)
