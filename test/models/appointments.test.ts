import { describe } from 'std/testing/bdd.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'

describe('db/models/appointments.ts', { sanitizeResources: false }, () => {
  describe('addOfferedTime', () => {
    itUsesTrxAnd.rejects(
      'does not add an offered time if provider_id is an admin',
      async (trx) => {
        const patient = await patients.insert(trx, { name: generateUUID() })
        const health_worker = await addTestHealthWorker(trx, {
          scenario: 'admin',
        })
        const patient_appointment_request = await appointments.createNewRequest(
          trx,
          { patient_id: patient.id },
        )

        const start = new Date()
        const end = new Date()
        end.setHours(start.getHours() + 1)
        const duration_minutes = 60

        await appointments.addOfferedTime(trx, {
          patient_appointment_request_id: patient_appointment_request.id,
          provider_id: health_worker.employee_id!,
          start,
          end,
          duration_minutes,
        })
      },
    )

    itUsesTrxAnd(
      'adds an offered time if provider_id is a doctor',
      async (trx) => {
        const patient = await patients.insert(trx, { name: generateUUID() })
        const health_worker = await addTestHealthWorker(trx, {
          scenario: 'doctor',
        })
        const patient_appointment_request = await appointments.createNewRequest(
          trx,
          { patient_id: patient.id },
        )

        const start = new Date()
        const end = new Date()
        end.setHours(start.getHours() + 1)
        const duration_minutes = 60

        await appointments.addOfferedTime(trx, {
          patient_appointment_request_id: patient_appointment_request.id,
          provider_id: health_worker.employee_id!,
          start,
          end,
          duration_minutes,
        })
      },
    )
  })
})
