import { describe } from 'std/testing/bdd.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'

describe('db/models/appointments.ts', { sanitizeResources: false }, () => {
  describe('addOfferedTime', () => {
    itUsesTrxAnd(
      'does not add an offered time if provider_id is an admin',
      async (trx) => {
        const patient = await patients.upsert(trx, { name: generateUUID() })
        const health_worker = await addTestHealthWorker(trx, {
          scenario: 'admin',
        })
        const patient_appointment_request = await appointments.createNewRequest(
          trx,
          { patient_id: patient.id },
        )

        await assertRejects(() =>
          appointments.addOfferedTime(trx, {
            patient_appointment_request_id: patient_appointment_request.id,
            provider_id: health_worker.employee_id!,
            start: new Date(),
          })
        )
      },
    )

    itUsesTrxAnd(
      'adds an offered time if provider_id is a doctor',
      async (trx) => {
        const patient = await patients.upsert(trx, { name: generateUUID() })
        const health_worker = await addTestHealthWorker(trx, {
          scenario: 'doctor',
        })
        const patient_appointment_request = await appointments.createNewRequest(
          trx,
          { patient_id: patient.id },
        )

        await appointments.addOfferedTime(trx, {
          patient_appointment_request_id: patient_appointment_request.id,
          provider_id: health_worker.employee_id!,
          start: new Date(),
        })
      },
    )
  })
})
