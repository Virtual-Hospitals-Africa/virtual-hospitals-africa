import { afterAll, describe } from 'std/testing/bdd.ts'
import { patient_measurements } from '../../db/models/patient_measurements.ts'
import * as vitals from '../../db/models/vitals.ts'
import db from '../../db/db.ts'
import { VITALS_SNOMED_CODE, VITALS_UNITS } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'

describe(
  'db/models/vitals.ts',
  () => {
    afterAll(() => db.destroy())
    describe('insertMeasurementsAndAssessments', () => {
      itUsesTrxAnd(
        'can save vital measurements with evaluations of varying priorities',
        async (trx) => {
          const health_worker = await addTestEmployee(trx, {
            profession: 'nurse',
            specialty: 'primary care',
            registration_status: 'approved',
          })
          const encounter =
            await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
              trx,
              '00000000-0000-0000-0000-000000000001',
              {
                employment_id: health_worker.employee_id,
              },
            )

          await vitals.insertMeasurementsAndAssessments(trx, {
            patient_id: encounter.patient.id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id:
              encounter.employee.patient_encounter_employee_id,
            employment_id: encounter.employee.employee_id,
            input_measurements: [
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.height,
                units: VITALS_UNITS.height,
                value: 123,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.weight,
                units: VITALS_UNITS.weight,
                value: 223,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_systolic,
                units: VITALS_UNITS.blood_pressure_systolic,
                value: 223,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_diastolic,
                units: VITALS_UNITS.blood_pressure_diastolic,
                value: 223,
              },
              {
                finding_id: generateUUID(),
                snomed_concept_id: VITALS_SNOMED_CODE.blood_oxygen_saturation,
                units: VITALS_UNITS.blood_oxygen_saturation,
                value: 0,
              },
            ],
            input_assessments: [],
          })

          const [most_recent_measurement_height] = await patient_measurements
            .getMostRecent(
              trx,
              {
                patient_id: encounter.patient.id,
                snomed_concept_ids: [VITALS_SNOMED_CODE.height],
              },
            )

          assertEquals(most_recent_measurement_height.value_display, '123 cm')
          assertEquals(most_recent_measurement_height.evaluations, [])

          const [most_recent_measurement_weight] = await patient_measurements
            .getMostRecent(
              trx,
              {
                patient_id: encounter.patient.id,
                snomed_concept_ids: [VITALS_SNOMED_CODE.weight],
              },
            )

          assertEquals(most_recent_measurement_weight.value_display, '223 kg')

          const [most_recent_measurement_blood_pressure_systolic] =
            await patient_measurements.getMostRecent(
              trx,
              {
                patient_id: encounter.patient.id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_pressure_systolic,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_pressure_systolic.value_display,
            '223 mmHg',
          )

          const [most_recent_measurement_blood_pressure_diastolic] =
            await patient_measurements.getMostRecent(
              trx,
              {
                patient_id: encounter.patient.id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_pressure_diastolic,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_pressure_diastolic.value_display,
            '223 mmHg',
          )

          const [most_recent_measurement_blood_oxygen_saturation] =
            await patient_measurements.getMostRecent(
              trx,
              {
                patient_id: encounter.patient.id,
                snomed_concept_ids: [
                  VITALS_SNOMED_CODE.blood_oxygen_saturation,
                ],
              },
            )

          assertEquals(
            most_recent_measurement_blood_oxygen_saturation.value_display,
            '0%',
          )
        },
      )
    })
  },
)
