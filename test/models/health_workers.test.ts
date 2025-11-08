import { afterAll, describe } from 'std/testing/bdd.ts'
import { testHealthWorker } from '../_helpers/health_workers.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import omit from '../../util/omit.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_worker_google_tokens.ts'

describe('db/models/health_workers.ts', () => {
  afterAll(() => db.destroy())
  describe('upsertWithGoogleCredentials', () => {
    itUsesTrxAnd(
      'works even if a previous health worker without tokens was inserted',
      async (trx) => {
        const health_worker_data = testHealthWorker()
        await health_workers.upsert(
          trx,
          omit(health_worker_data, [
            'access_token',
            'refresh_token',
            'expires_at',
            'expires_in',
          ]),
        )

        const result = await upsertWithGoogleCredentials(
          trx,
          health_worker_data,
        )

        assert(result)
        assertEquals(
          await health_workers.getById(trx, result.id),
          {
            ...result,
            employment: [],
            default_organization_id: null,
          },
        )
        assert(!!result.access_token)
        assert(!!result.refresh_token)
      },
    )
  })

  describe('getById', () => {
    itUsesTrxAnd(
      'returns the health worker and their employment information',
      async (trx) => {
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const result = await health_workers.getById(trx, health_worker.id)

        assertEquals(result, {
          avatar_url: health_worker.avatar_url,
          email: health_worker.email,
          employment: [
            {
              organization: {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'VHA Test Clinic South Africa',
                address: '123 Main St, Polokwane, South Africa, 23456',
              },
              roles: {
                admin: null,
                doctor: null,
                receptionist: null,
                nurse: {
                  registration_completed: false,
                  registration_needed: true,
                  registration_pending_approval: true,
                  employment_id: health_worker.employee_id,
                },
              },
              provider_id: health_worker.employee_id,
              non_admin_id: health_worker.employee_id,
              gcal_appointments_calendar_id:
                health_worker.calendars!.gcal_appointments_calendar_id,
              gcal_availability_calendar_id:
                health_worker.calendars!.gcal_availability_calendar_id,
              availability_set: true,
              departments: result.employment[0].departments,
            },
          ],
          default_organization_id: '00000000-0000-0000-0000-000000000001',
          id: health_worker.id,
          name: health_worker.name,
          first_names: health_worker.first_names,
          surname: health_worker.surname,
          preferred_name: health_worker.preferred_name,
        })
      },
    )
  })
})
