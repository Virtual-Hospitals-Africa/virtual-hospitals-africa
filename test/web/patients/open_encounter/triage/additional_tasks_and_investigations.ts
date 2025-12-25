import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupTriage } from './_setup.ts'
import { route } from '../../../../route.ts'
import { getTasksGroups } from '../../../../../db/models/additional_tasks.ts'

describe('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  it('loads on the page', async () => {
    const { $, clinic, encounter } = await setupTriage({
      patient_demographics: { date_of_birth: '2023-01-01' },
      conditions: ['diabetes'],
      warning_signs: [],
      vitals: {
        measurements: {
          blood_oxygen_saturation: {
            value: 91,
            units: '%',
          },
        },
        assessments: {},
      },
    })

    assertEquals(
      $.url,
      `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/additional_tasks_and_investigations`,
    )

    const result = await getTasksGroups(db, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
    })

    console.log(result)
  })
})
