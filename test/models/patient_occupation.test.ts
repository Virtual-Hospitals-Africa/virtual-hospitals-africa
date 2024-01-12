import { assert } from 'std/assert/assert.ts'
import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patient_occupations from '../../db/models/patient_occupations.ts'
import * as patients from '../../db/models/patients.ts'

describe(
  'db/models/patient_occupation.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('upsert', () => {
      it('inserts patient_occupations', async () => {
        const patient = await patients.upsert(db, { name: 'Test Patient' })

        const patient_occupation = await patient_occupations.upsert(db, {
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

      it('can replace an existing patient occupation', async () => {
        const patient = await patients.upsert(db, { name: 'Test Patient' })

        await patient_occupations.upsert(db, {
          patient_id: patient.id,
          occupation: {
            school: {
              status: 'in school',
              grade: 'ECD 1',
            },
          },
        })

        await patient_occupations.upsert(db, {
          patient_id: patient.id,
          occupation: {
            school: {
              status: 'never attended',
            },
          },
        })

        const occupation = await patient_occupations.get(db, {
          patient_id: patient.id,
        })
        assert(occupation)
        assert(occupation.school.status === 'never attended')
      })
    })
  },
)
