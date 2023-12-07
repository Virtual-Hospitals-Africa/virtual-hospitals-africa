import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'

describe(
  'db/models/patient_conditions.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('upsertPreExisting', () => {
      it('upserts pre-existing conditions, those without an end_date', async () => {
        const patient = await patients.upsert(db, { name: 'Billy Bob' })
        await patient_conditions.upsertPreExisting(db, patient.id, [
          {
            key_id: 'c_22401',
            start_date: '2020-01-01',
            medications: [
              {
                medication_id: 1,
                dosage: '1 pill',
                intake_frequency: 'qw / once a week',
              },
            ],
          },
        ])
        const preExistingConditions = await patient_conditions
          .getPreExistingConditions(db, {
            patient_id: patient.id,
          })
        assertEquals(preExistingConditions.length, 1)
        const [preExistingCondition] = preExistingConditions
        assertEquals(preExistingCondition.comorbidities, [])
        assertEquals(preExistingCondition.key_id, 'c_22401')
        assertEquals(preExistingCondition.primary_name, 'Filtering bleb failed')
        assertEquals(preExistingCondition.start_date, '2020-01-01')
        assertEquals(preExistingCondition.medications.length, 1)
        assertEquals(preExistingCondition.medications[0].dosage, '1 pill')
        assertEquals(
          preExistingCondition.medications[0].generic_name,
          'SODIUM CHLORIDE',
        )
        assertEquals(
          preExistingCondition.medications[0].intake_frequency,
          'qw / once a week',
        )
        assertEquals(preExistingCondition.medications[0].medication_id, 1)
        assertEquals(
          preExistingCondition.medications[0].strength,
          '6G/1000 ML;0.9% W/W;0.9%;0.9 % (W/V)',
        )
      })
    })
  },
)
