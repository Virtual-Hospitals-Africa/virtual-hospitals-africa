import { afterAll, describe } from 'std/testing/bdd.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patient_findings from '../../db/models/patient_findings.ts'
import * as vitals from '../../db/models/vitals.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import db from '../../db/db.ts'
import { VITALS_SNOMED_CODE, VITALS_UNITS } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'

describe(
  'db/models/vitals.ts',
  () => {
    afterAll(() => db.destroy())
    describe('insertMeasurements', () => {
      itUsesTrxAnd(
        'can save vital measurements with evaluations of varying priorities',
        async (trx) => {
          const patient = await patients.insert(trx, { name: 'Test Patient' })
          const patient_id = patient.id
          const healthWorker = await addTestHealthWorker(trx, {
            scenario: 'approved-nurse',
          })
          const encounter = await patient_encounters.insert(
            trx,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_id,
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )

          await vitals.insertMeasurements(trx, {
            patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            input_measurements: [
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.height,
                units: VITALS_UNITS.height,
                value: 123,
                evaluation: null,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.weight,
                units: VITALS_UNITS.weight,
                value: 223,
                evaluation: {
                  priority: 'Non-urgent',
                  note: 'Quite heavy',
                },
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_systolic,
                units: VITALS_UNITS.blood_pressure_systolic,
                value: 223,
                evaluation: {
                  priority: 'Urgent',
                  note: 'Very high pressure',
                },
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_diastolic,
                units: VITALS_UNITS.blood_pressure_diastolic,
                value: 223,
                evaluation: {
                  priority: 'Very urgent',
                  note: 'Extremely high pressure',
                },
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_oxygen_saturation,
                units: VITALS_UNITS.blood_oxygen_saturation,
                value: 0,
                evaluation: {
                  priority: 'Emergency',
                  note: 'No oxygen at all!!',
                },
              },
            ],
          })

          const [most_recent_measurement_height] = await patient_findings
            .getMostRecentMeasurements(
              trx,
              { patient_id, snomed_concept_ids: [VITALS_SNOMED_CODE.height] },
            )

          assertEquals(most_recent_measurement_height.value_display, '123 cm')
          assertEquals(most_recent_measurement_height.evaluations, [])

          const [most_recent_measurement_weight] = await patient_findings
            .getMostRecentMeasurements(
              trx,
              { patient_id, snomed_concept_ids: [VITALS_SNOMED_CODE.weight] },
            )

          assertEquals(most_recent_measurement_weight.value_display, '223 kg')
          assertEquals(most_recent_measurement_weight.evaluations, [{
            note: 'Quite heavy',
            snomed_concept_id: PRIORITY_SNOMED_CODES['Non-urgent'],
          }])

          const [most_recent_measurement_blood_pressure_systolic] =
            await patient_findings.getMostRecentMeasurements(
              trx,
              {
                patient_id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_pressure_systolic,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_pressure_systolic.value_display,
            '223 mmHg',
          )
          assertEquals(
            most_recent_measurement_blood_pressure_systolic.evaluations,
            [{
              note: 'Very high pressure',
              snomed_concept_id: PRIORITY_SNOMED_CODES['Urgent'],
            }],
          )

          const [most_recent_measurement_blood_pressure_diastolic] =
            await patient_findings.getMostRecentMeasurements(
              trx,
              {
                patient_id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_pressure_diastolic,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_pressure_diastolic.value_display,
            '223 mmHg',
          )
          assertEquals(
            most_recent_measurement_blood_pressure_diastolic.evaluations,
            [{
              note: 'Extremely high pressure',
              snomed_concept_id: PRIORITY_SNOMED_CODES['Very urgent'],
            }],
          )

          const [most_recent_measurement_blood_oxygen_saturation] =
            await patient_findings.getMostRecentMeasurements(
              trx,
              {
                patient_id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_oxygen_saturation,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_oxygen_saturation.value_display,
            '0%',
          )
          assertEquals(
            most_recent_measurement_blood_oxygen_saturation.evaluations,
            [
              {
                snomed_concept_id: PRIORITY_SNOMED_CODES['Emergency'],
                note: 'No oxygen at all!!',
              },
            ],
          )
        },
      )

      itUsesTrxAnd(
        'can save vital measurements with no evaluations',
        async (trx) => {
          const patient = await patients.insert(trx, { name: 'Test Patient' })
          const patient_id = patient.id
          const healthWorker = await addTestHealthWorker(trx, {
            scenario: 'approved-nurse',
          })
          const encounter = await patient_encounters.insert(
            trx,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_id,
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )

          await vitals.insertMeasurements(trx, {
            patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            input_measurements: [
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.height,
                units: VITALS_UNITS.height,
                value: 123,
                evaluation: null,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_systolic,
                units: VITALS_UNITS.blood_pressure_systolic,
                value: 223,
                evaluation: null,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_oxygen_saturation,
                units: VITALS_UNITS.blood_oxygen_saturation,
                value: 0,
                evaluation: null,
              },
            ],
          })

          const [most_recent_measurement_height] = await patient_findings
            .getMostRecentMeasurements(
              trx,
              { patient_id, snomed_concept_ids: [VITALS_SNOMED_CODE.height] },
            )

          assertEquals(most_recent_measurement_height.value_display, '123 cm')
          assertEquals(most_recent_measurement_height.evaluations, [])

          const [most_recent_measurement_blood_pressure_systolic] =
            await patient_findings.getMostRecentMeasurements(
              trx,
              {
                patient_id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_pressure_systolic,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_pressure_systolic.value_display,
            '223 mmHg',
          )
          assertEquals(
            most_recent_measurement_blood_pressure_systolic.evaluations,
            [],
          )

          const [most_recent_measurement_blood_oxygen_saturation] =
            await patient_findings.getMostRecentMeasurements(
              trx,
              {
                patient_id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_oxygen_saturation,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_oxygen_saturation.value_display,
            '0%',
          )
          assertEquals(
            most_recent_measurement_blood_oxygen_saturation.evaluations,
            [],
          )
        },
      )
    })
  },
)
