import { it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patient_general_assessments from '../../../db/models/patient_general_assessments.ts'
import db from '../../../db/db.ts'
import { assert } from 'std/assert/assert.ts'

describeWithWebServer(
  '/app/patients/[patient_id]/encounters/open/general_assessments',
  8011,
  (route) => {
    it('can save asssessments on POST', async () => {
      const { healthWorker, fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })

      const body = new FormData()
      body.append('cold', 'on')
      body.append('musty', 'on')
      body.append('alcohol', 'on')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessments.get(
        db,
        {
          patient_id: encounter.patient_id,
          encounter_id: encounter.id,
        },
      )
      assertEquals(assessments, [{ assessment: 'cold' }, {
        assessment: 'musty',
      }, {
        assessment: 'alcohol',
      }])
    })

    it('can overwrite existing asssessments on POST', async () => {
      const { healthWorker, fetch, fetchCheerio } =
        await addTestHealthWorkerWithSession(db, {
          scenario: 'approved-nurse',
        })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })
      await patient_general_assessments.upsert(db, {
        patient_id: encounter.patient_id,
        encounter_id: encounter.id,
        encounter_provider_id: encounter.providers[0].encounter_provider_id,
        assessments: [
          'cold',
          'musty',
          'alcohol',
        ],
      })

      const body = new FormData()
      body.append('cold', 'on')
      body.append('thin', 'on')

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessments.get(
        db,
        {
          patient_id: encounter.patient_id,
          encounter_id: encounter.id,
        },
      )
      assertEquals(assessments, [{ assessment: 'cold' }, {
        assessment: 'thin',
      }])

      const $ = await fetchCheerio(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
      )

      const checkboxes = $('input[type="checkbox"]')
      assert(checkboxes.length)

      checkboxes.each((_i, el) => {
        if ('checked' in el.attribs) {
          const label = $(el).parent().parent().find('label').html()
          assert(label === 'all normal' || label === 'thin' || label === 'cold')
        }
      })
    })

    it('can remove existing asssessments on POST, showing the categories as "all normal" on refetch', async () => {
      const { healthWorker, fetch, fetchCheerio } =
        await addTestHealthWorkerWithSession(db, {
          scenario: 'approved-nurse',
        })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })

      await patient_general_assessments.upsert(db, {
        patient_id: encounter.patient_id,
        encounter_id: encounter.id,
        encounter_provider_id: encounter.providers[0].encounter_provider_id,
        assessments: [
          'thin',
          'cold',
          'alcohol',
        ],
      })

      const body = new FormData()

      const response = await fetch(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
        {
          method: 'POST',
          body,
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const assessments = await patient_general_assessments.get(
        db,
        {
          patient_id: encounter.patient_id,
          encounter_id: encounter.id,
        },
      )
      assertEquals(assessments.length, 0)

      const $ = await fetchCheerio(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
      )

      const categories = await db.selectFrom('general_assessment_categories')
        .selectAll().execute()

      assert(categories.length)

      categories.forEach(({ category }) => {
        const header = $(`h2:contains("${category}")`).first()
        assert(header.html())
        const checkboxes = header.parent().find('input[type="checkbox"]')
        assert(checkboxes.length)

        checkboxes.each((i, el) => {
          const checked = 'checked' in el.attribs
          assertEquals(
            checked,
            i === 0,
            '"all normal" should be checked, others not',
          )
        })
      })
    })

    it('renders a blank form on initial GET, including "all normal"', async () => {
      const { healthWorker, fetchCheerio } =
        await addTestHealthWorkerWithSession(db, {
          scenario: 'approved-nurse',
        })
      const encounter = await patient_encounters.upsert(db, 1, {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
        provider_ids: [healthWorker.employee_id!],
      })

      const $ = await fetchCheerio(
        `${route}/app/patients/${encounter.patient_id}/encounters/open/general_assessments`,
      )

      const categories = await db.selectFrom('general_assessment_categories')
        .selectAll().execute()

      assert(categories.length)

      categories.forEach(({ category }) => {
        const header = $(`h2:contains("${category}")`).first()
        assert(header.html())
        const checkboxes = header.parent().find('input[type="checkbox"]')
        assert(checkboxes.length)

        checkboxes.each((_i, el) => {
          const checked = 'checked' in el.attribs
          assert(!checked)
        })
      })
    })
  },
)
