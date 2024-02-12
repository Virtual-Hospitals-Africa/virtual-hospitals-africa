import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_general_assessments from '../../db/models/patient_general_assessments.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/patient_general_assessments.ts', {
  sanitizeResources: false,
}, () => {
  describe('upsert', () => {
    itUsesTrxAnd(
      'upserts assessments when no assessments exist',
      async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'approved-nurse',
        })
        const patient = await patients.upsert(trx, { name: 'Test Patient' })
        const encounter = await patient_encounters.upsert(trx, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [nurse.employee_id!],
        })

        await patient_general_assessments.upsert(trx, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          assessments: ['thin', 'cold', 'alcohol'],
        })

        const patientAssessments = await patient_general_assessments.get(
          trx,
          { patient_id: patient.id, encounter_id: encounter.id },
        )

        assertEquals(patientAssessments.length, 3)
      },
    )

    itUsesTrxAnd(
      'handles updates and removing patient assessments',
      async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'approved-nurse',
        })
        const patient = await patients.upsert(trx, { name: 'Test Patient' })
        const encounter = await patient_encounters.upsert(trx, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [nurse.employee_id!],
        })

        await patient_general_assessments.upsert(trx, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          assessments: ['thin', 'cold', 'alcohol'],
        })

        const patientAssessments = await patient_general_assessments.get(
          trx,
          { patient_id: patient.id, encounter_id: encounter.id },
        )

        assertEquals(patientAssessments.length, 3)

        await patient_general_assessments.upsert(trx, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          assessments: ['cold', 'rash'],
        })

        const patientAssessmentsAfterRemoving =
          await patient_general_assessments
            .get(trx, { patient_id: patient.id, encounter_id: encounter.id })

        assertEquals(patientAssessmentsAfterRemoving.length, 2)
        assertEquals(
          patientAssessmentsAfterRemoving.some((c) => c.assessment === 'cold'),
          true,
        )
        assertEquals(
          patientAssessmentsAfterRemoving.some((c) => c.assessment === 'rash'),
          true,
        )
      },
    )
  })

  describe('getByCategory', () => {
    itUsesTrxAnd(
      'resolves with the general assessment categories along with which were checked during a given encounter',
      async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'approved-nurse',
        })
        const patient = await patients.upsert(trx, { name: 'Test Patient' })
        const encounter = await patient_encounters.upsert(trx, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [nurse.employee_id!],
        })

        await patient_general_assessments.upsert(trx, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          assessments: ['thin', 'cold', 'alcohol'],
        })

        const by_category = await patient_general_assessments
          .getByCategory(
            trx,
            { patient_id: patient.id, encounter_id: encounter.id },
          )

        assertEquals(by_category, [
          {
            category: 'Patient state',
            assessments: [
              { assessment: 'ill', checked: false },
              { assessment: 'unalert', checked: false },
              { assessment: 'confused', checked: false },
              { assessment: 'drowsy', checked: false },
              { assessment: 'febrile', checked: false },
              { assessment: 'dehydrated', checked: false },
              { assessment: 'uncooperative', checked: false },
              { assessment: 'sad', checked: false },
              { assessment: 'resentful', checked: false },
              { assessment: 'fat', checked: false },
              { assessment: 'wasted', checked: false },
              { assessment: 'in pain', checked: false },
              { assessment: 'in distress', checked: false },
            ],
          },
          {
            category: 'Hands',
            assessments: [
              { assessment: 'cold hands', checked: false },
              { assessment: 'sweaty', checked: false },
              { assessment: 'clammy', checked: false },
              { assessment: 'peripheral cyanosis', checked: false },
              { assessment: 'nicotine stains', checked: false },
            ],
          },
          {
            category: 'Nails',
            assessments: [
              { assessment: 'leukonychia', checked: false },
              { assessment: 'koilonychia', checked: false },
              { assessment: 'clubbing', checked: false },
              { assessment: 'splinter hemorrhages', checked: false },
              { assessment: 'pitting', checked: false },
              { assessment: 'onycholysis', checked: false },
            ],
          },
          {
            category: 'Palms',
            assessments: [
              { assessment: 'erythema', checked: false },
              { assessment: 'Dupuytren’s contracture', checked: false },
              { assessment: 'Joints', checked: false },
              { assessment: 'skin swelling', checked: false },
            ],
          },
          {
            category: 'Colour',
            assessments: [
              { assessment: 'jaundice', checked: false },
              { assessment: 'pale', checked: false },
            ],
          },
          {
            category: 'Texture',
            assessments: [
              { assessment: 'thin', checked: true },
              { assessment: 'thick', checked: false },
              { assessment: 'dry', checked: false },
              { assessment: 'rash', checked: false },
            ],
          },
          {
            category: 'Distribution',
            assessments: [
              { assessment: 'hands and feet', checked: false },
              { assessment: 'extensor surfaces', checked: false },
              { assessment: 'flexural surfaces', checked: false },
              { assessment: 'truncal', checked: false },
              { assessment: 'exposed sites', checked: false },
              { assessment: 'asymmetrical', checked: false },
              { assessment: 'discrete', checked: false },
              { assessment: 'confluent', checked: false },
            ],
          },
          {
            category: 'Pattern',
            assessments: [
              { assessment: 'linear', checked: false },
              { assessment: 'annular/ring-like', checked: false },
              { assessment: 'serpiginous/snake-like', checked: false },
              { assessment: 'reticular/net-like', checked: false },
              { assessment: 'star shaped', checked: false },
              { assessment: 'flat macular', checked: false },
              { assessment: 'raised papular', checked: false },
              { assessment: 'localized plaque', checked: false },
              { assessment: 'wheal', checked: false },
              { assessment: 'blisters', checked: false },
              { assessment: 'bullae', checked: false },
              { assessment: 'large vesicles', checked: false },
              { assessment: 'nodules', checked: false },
              { assessment: 'purpura', checked: false },
            ],
          },
          {
            category: 'Surface',
            assessments: [
              { assessment: 'scaly', checked: false },
              { assessment: 'shiny', checked: false },
              { assessment: 'well demarcated edges', checked: false },
              { assessment: 'red pigment', checked: false },
              { assessment: 'white pigment', checked: false },
              { assessment: 'blue pigment', checked: false },
              { assessment: 'brown pigment', checked: false },
              { assessment: 'black pigment', checked: false },
            ],
          },
          {
            category: 'Character',
            assessments: [
              { assessment: 'cold', checked: true },
              { assessment: 'tender', checked: false },
              { assessment: 'blanching', checked: false },
              { assessment: 'purpura character', checked: false },
            ],
          },
          {
            category: 'Tongue',
            assessments: [
              { assessment: 'central cyanosis', checked: false },
              { assessment: 'moist', checked: false },
              { assessment: 'dry tongue', checked: false },
            ],
          },
          {
            category: 'Teeth',
            assessments: [
              { assessment: 'caries', checked: false },
              { assessment: 'poor hygiene', checked: false },
              { assessment: 'false teeth', checked: false },
            ],
          },
          {
            category: 'Gums',
            assessments: [
              { assessment: 'bleeding', checked: false },
              { assessment: 'swollen', checked: false },
            ],
          },
          {
            category: 'Tonsils',
            assessments: [
              { assessment: 'swelling', checked: false },
              { assessment: 'redness tonsils', checked: false },
              { assessment: 'ulceration', checked: false },
            ],
          },
          {
            category: 'Pharynx',
            assessments: [
              { assessment: 'swelling pharynx', checked: false },
              { assessment: 'redness pharynx', checked: false },
              { assessment: 'ulceration pharynx', checked: false },
            ],
          },
          {
            category: 'Breath',
            assessments: [
              { assessment: 'ketosis', checked: false },
              { assessment: 'alcohol', checked: true },
              { assessment: 'fetor', checked: false },
              { assessment: 'musty', checked: false },
            ],
          },
          {
            category: 'Sclera',
            assessments: [{ assessment: 'icterus', checked: false }],
          },
          {
            category: 'Conjunctiva',
            assessments: [
              { assessment: 'pale conjunctiva', checked: false },
              { assessment: 'redness conjunctiva', checked: false },
              { assessment: 'swelling conjunctiva', checked: false },
            ],
          },
        ])
      },
    )
  })
})
