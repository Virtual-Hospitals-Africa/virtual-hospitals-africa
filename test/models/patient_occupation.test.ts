import { assert } from 'std/assert/assert.ts'
import { describe } from 'std/testing/bdd.ts'
import * as patient_occupations from '../../db/models/patient_occupations.ts'
import * as patients from '../../db/models/patients.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe(
  'db/models/patient_occupation.ts',
  { sanitizeResources: false },
  () => {
    describe('upsert', () => {
      itUsesTrxAnd('inserts patient_occupations', async (trx) => {
        const patient = await patients.insert(trx, { name: 'Test Patient' })

        const patient_occupation = await patient_occupations.upsert(trx, {
          patient_id: patient.id,
          occupation: {
            school: {
              status: 'in school',
              grade: 'ECD 1',
            },
          },
        })

        assert(patient_occupation)
      })

      itUsesTrxAnd(
        'can replace an existing patient occupation',
        async (trx) => {
          const patient = await patients.insert(trx, { name: 'Test Patient' })

          await patient_occupations.upsert(trx, {
            patient_id: patient.id,
            occupation: {
              school: {
                status: 'in school',
                grade: 'ECD 1',
              },
            },
          })

          await patient_occupations.upsert(trx, {
            patient_id: patient.id,
            occupation: {
              school: {
                status: 'never attended',
              },
            },
          })

          const occupation = await patient_occupations.get(trx, {
            patient_id: patient.id,
          })
          assert(occupation)
          assert(occupation.school.status === 'never attended')
        },
      )
    })
  },
)
