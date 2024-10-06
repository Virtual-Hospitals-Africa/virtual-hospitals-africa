import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestHealthWorkerWithSession, route } from '../utilities.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patients from '../../../db/models/patients.ts'
import {
  forPatientEncounter,
  getPatientExamination,
  upsertFindings,
} from '../../../db/models/examinations.ts'
import db from '../../../db/db.ts'
import { assert } from 'std/assert/assert.ts'

describe(
  '/app/patients/[patient_id]/encounters/open/examinations',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    describe('Head-to-Toe Assessment', () => {
      it('saves on POST', async () => {
        const { healthWorker, fetch } = await addTestHealthWorkerWithSession(
          db,
          {
            scenario: 'approved-nurse',
          },
        )
        const encounter = await patient_encounters.upsert(
          db,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_name: 'Test Patient',
            reason: 'seeking treatment',
            provider_ids: [healthWorker.employee_id!],
          },
        )
        await patients.update(db, {
          id: encounter.patient_id,
          gender: 'female',
          birthDate: '1980-01-01',
        })

        const body = new FormData()
        body.append('Character.cold', 'on')

        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations`,
          {
            method: 'POST',
            body,
          },
        )
        if (!response.ok) throw new Error(await response.text())
        const patient_examination = await getPatientExamination(
          db,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            examination_name: 'Head-to-toe Assessment',
          },
        )
        assertEquals(patient_examination.completed, true)

        const on_values: unknown[] = []
        patient_examination.categories.forEach((category) => {
          category.findings.forEach((finding) => {
            if (finding.value) {
              on_values.push({ category: category.category, finding })
            }
          })
        })
        assertEquals(on_values, [
          {
            category: 'Character',
            finding: {
              label: 'cold',
              name: 'cold',
              options: null,
              required: false,
              type: 'boolean',
              value: true,
            },
          },
        ])
      })

      it('removes existing assessment findings on POST, showing the categories as "all normal" on refetch', async () => {
        const { healthWorker, fetch, fetchCheerio } =
          await addTestHealthWorkerWithSession(db, {
            scenario: 'approved-nurse',
          })
        const encounter = await patient_encounters.upsert(
          db,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_name: 'Test Patient',
            reason: 'seeking treatment',
            provider_ids: [healthWorker.employee_id!],
          },
        )
        await patients.update(db, {
          id: encounter.patient_id,
          gender: 'female',
          birthDate: '1980-01-01',
        })

        await upsertFindings(db, {
          patient_id: encounter.patient_id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          examination_name: 'Head-to-toe Assessment',
          values: {
            'Character': {
              'cold': true,
            },
          },
        })

        const body = new FormData()

        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?examination=Head-to-toe+Assessment`,
          {
            method: 'POST',
            body,
          },
        )
        if (!response.ok) throw new Error(await response.text())
        const patient_examination = await getPatientExamination(
          db,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            examination_name: 'Head-to-toe Assessment',
          },
        )
        assertEquals(patient_examination.completed, true)

        const on_values: unknown[] = []
        patient_examination.categories.forEach((category) => {
          category.findings.forEach((finding) => {
            if (finding.value) {
              on_values.push({ category: category.category, finding })
            }
          })
        })
        assertEquals(on_values, [])

        const $ = await fetchCheerio(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?examination=Head-to-toe+Assessment`,
        )

        const categories = await db
          .selectFrom('examination_categories')
          .where('examination_name', '=', 'Head-to-toe Assessment')
          .selectAll()
          .execute()

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

      it('updates existing assessment findings on POST, showing the categories as "all normal" on refetch', async () => {
        const { healthWorker, fetch, fetchCheerio } =
          await addTestHealthWorkerWithSession(db, {
            scenario: 'approved-nurse',
          })
        const encounter = await patient_encounters.upsert(
          db,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_name: 'Test Patient',
            reason: 'seeking treatment',
            provider_ids: [healthWorker.employee_id!],
          },
        )
        await patients.update(db, {
          id: encounter.patient_id,
          gender: 'female',
          birthDate: '1980-01-01',
        })

        await upsertFindings(db, {
          patient_id: encounter.patient_id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          examination_name: 'Head-to-toe Assessment',
          values: {
            'Character': {
              'cold': true,
            },
          },
        })

        const body = new FormData()
        body.append('Surface.scaly', 'on')

        const response = await fetch(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?examination=Head-to-toe+Assessment`,
          {
            method: 'POST',
            body,
          },
        )
        if (!response.ok) throw new Error(await response.text())
        const patient_examination = await getPatientExamination(
          db,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            examination_name: 'Head-to-toe Assessment',
          },
        )
        assertEquals(patient_examination.completed, true)

        const on_values: unknown[] = []
        patient_examination.categories.forEach((category) => {
          category.findings.forEach((finding) => {
            if (finding.value) {
              on_values.push({ category: category.category, finding })
            }
          })
        })
        assertEquals(on_values, [
          {
            category: 'Surface',
            finding: {
              label: 'scaly',
              name: 'scaly',
              options: null,
              required: false,
              type: 'boolean',
              value: true,
            },
          },
        ])

        const $ = await fetchCheerio(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?examination=Head-to-toe+Assessment`,
        )

        const categories = await db
          .selectFrom('examination_categories')
          .where('examination_name', '=', 'Head-to-toe Assessment')
          .selectAll()
          .execute()

        assert(categories.length)

        categories.forEach(({ category }) => {
          const header = $(`h2:contains("${category}")`).first()
          assert(header.html())
          const checkboxes = header.parent().find('input[type="checkbox"]')
          assert(checkboxes.length)

          if (category === 'Surface') {
            checkboxes.each((_i, el) => {
              const checked = 'checked' in el.attribs
              assertEquals(
                checked,
                el.attribs.name === 'Surface.scaly',
                '"Surface.scaly" should be checked, others not',
              )
            })
          } else {
            checkboxes.each((i, el) => {
              const checked = 'checked' in el.attribs
              assertEquals(
                checked,
                i === 0,
                '"all normal" should be checked, others not',
              )
            })
          }
        })
      })

      it('renders a blank form on initial GET, including "all normal"', async () => {
        const { healthWorker, fetchCheerio } =
          await addTestHealthWorkerWithSession(db, {
            scenario: 'approved-nurse',
          })
        const encounter = await patient_encounters.upsert(
          db,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_name: 'Test Patient',
            reason: 'seeking treatment',
            provider_ids: [healthWorker.employee_id!],
          },
        )
        await patients.update(db, {
          id: encounter.patient_id,
          gender: 'female',
          birthDate: '1980-01-01',
        })

        const $ = await fetchCheerio(
          `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations`,
        )

        const categories = await db
          .selectFrom('examination_categories')
          .where('examination_name', '=', 'Head-to-toe Assessment')
          .selectAll()
          .execute()

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
    })

    describe('?add=examinations', () => {
      describe('GET', () => {
        it('shows a form allowing orders to be placed for a doctor', async () => {
          const { healthWorker, fetchCheerio } =
            await addTestHealthWorkerWithSession(db, {
              scenario: 'doctor',
            })
          const encounter = await patient_encounters.upsert(
            db,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_name: 'Test Patient',
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )
          await patients.update(db, {
            id: encounter.patient_id,
            gender: 'female',
            birthDate: '1980-01-01',
          })
          const $ = await fetchCheerio(
            `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?add=examinations`,
          )
          assertEquals($('p:contains("Diagnostic Tests to Order")').length, 1)
        })

        it('shows a form without a an orders field for a nurse', async () => {
          const { healthWorker, fetchCheerio } =
            await addTestHealthWorkerWithSession(db, {
              scenario: 'approved-nurse',
            })
          const encounter = await patient_encounters.upsert(
            db,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_name: 'Test Patient',
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )
          await patients.update(db, {
            id: encounter.patient_id,
            gender: 'female',
            birthDate: '1980-01-01',
          })
          const $ = await fetchCheerio(
            `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?add=examinations`,
          )
          assertEquals($('p:contains("Diagnostic Tests to Order")').length, 0)
        })
      })

      describe('POST', () => {
        it('allows orders to be placed for a doctor', async () => {
          const { healthWorker, fetch } = await addTestHealthWorkerWithSession(
            db,
            {
              scenario: 'doctor',
            },
          )
          const encounter = await patient_encounters.upsert(
            db,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_name: 'Test Patient',
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )
          await patients.update(db, {
            id: encounter.patient_id,
            gender: 'female',
            birthDate: '1980-01-01',
          })

          const body = new FormData()
          body.append('diagnostic_test_orders[0]', 'Diabetes')

          const response = await fetch(
            `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?add=examinations`,
            {
              method: 'POST',
              body,
            },
          )

          if (!response.ok) throw new Error(await response.text())

          const patient_examinations = await forPatientEncounter(
            db,
          ).selectFrom('patient_examinations_with_recommendations')
            .selectAll()
            .where('encounter_id', '=', encounter.id)
            .execute()

          assertEquals(patient_examinations, [
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              examination_name: 'Head-to-toe Assessment',
              completed: false,
              skipped: false,
              ordered: false,
              recommended: true,
            },
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              examination_name: "Women's Health Assessment",
              completed: false,
              skipped: false,
              ordered: false,
              recommended: true,
            },
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              examination_name: 'Diabetes',
              completed: false,
              skipped: false,
              ordered: true,
              recommended: false,
            },
          ])
        })

        it('does not allow orders to be placed for a nurse', async () => {
          const { healthWorker, fetch } = await addTestHealthWorkerWithSession(
            db,
            {
              scenario: 'approved-nurse',
            },
          )
          const encounter = await patient_encounters.upsert(
            db,
            '00000000-0000-0000-0000-000000000001',
            {
              patient_name: 'Test Patient',
              reason: 'seeking treatment',
              provider_ids: [healthWorker.employee_id!],
            },
          )
          await patients.update(db, {
            id: encounter.patient_id,
            gender: 'female',
            birthDate: '1980-01-01',
          })

          const body = new FormData()
          body.append('diagnostic_test_orders[0]', 'Diabetes')

          const response = await fetch(
            `${route}/app/patients/${encounter.patient_id}/encounters/open/examinations?add=examinations&expectedTestError=1`,
            {
              method: 'POST',
              body,
            },
          )

          assertEquals(response.status, 403)
        })
      })
    })
  },
)
