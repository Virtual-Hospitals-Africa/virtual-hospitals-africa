import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { asWarningSignsAdult, setupTriageNewPatient } from './triage/_setup.ts'
import { patient_findings } from '../../../../db/models/patient_findings.ts'
import { events } from '../../../../db/models/events.ts'
import { assertMatches } from '../../../../util/assertMatches.ts'
import asFormData from '../../../../util/asFormData.ts'
import generateUUID from '../../../../util/uuid.ts'
import { EMERGENCY_EXAMINATION_FOR_TRIAGE, HISTORY_TAKING_LIMITED } from '../../../../shared/snomed_concepts.ts'
import { ClinicalFindingSchema } from '../../../../shared/clinical_finding_post.ts'
import { z } from 'zod'
import { route } from '../../../_route.ts'

const COUGH = '(clinical_finding (snomed_concept "Cough" "finding"))'
const NO_COUGH = '(clinical_finding (snomed_concept "Cough" "finding") (snomed_concept "No" "qualifier value"))'

type Setup = Awaited<ReturnType<typeof setupTriageNewPatient>>

function postClinicalFinding(
  { nurse, openEncounterRoute }: Setup,
  body: z.input<typeof ClinicalFindingSchema>,
  { referer }: { referer: string | null },
) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (referer) headers.Referer = referer
  return nurse.fetch(openEncounterRoute('clinical_finding'), {
    method: 'POST',
    body: asFormData(body),
    headers,
  })
}

async function postClinicalFindingOk(
  setup: Setup,
  body: z.input<typeof ClinicalFindingSchema>,
  opts: { referer: string },
) {
  const response = await postClinicalFinding(setup, body, opts)
  const json = await response.json()
  assertEquals(response.status, 200, JSON.stringify(json))
  assertEquals(json, { success: true })
}

async function expect400(response_promise: Promise<Response>) {
  const response = await response_promise
  await response.body?.cancel()
  assertEquals(response.status, 400)
}

describeParallel('/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/clinical_finding', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('POST', () => {
    itParallel(
      'saves a positive finding with the supplied id under a new procedure for the referring step and dispatches SinglePositiveFindingAdded',
      async () => {
        const setup = await setupTriageNewPatient({ patient_demographics: {} })
        const { patient_id, patient_encounter_id, triageRoute } = setup
        const finding_id = generateUUID()

        await postClinicalFindingOk(
          setup,
          { finding_id, s_expression: COUGH, priority_level: 'Urgent' },
          { referer: `${route}${triageRoute('brief_history')}` },
        )

        const this_patient_findings = await patient_findings.findAll(db, { patient_id })
        const [cough] = this_patient_findings
        assert(cough?.as_part_of_procedure)
        assertMatches(this_patient_findings, [
          {
            id: finding_id,
            patient_encounter_id,
            specific_snomed_concept_name: 'Cough',
            existence: 'Yes',
            priority: 'Urgent',
            as_part_of_procedure: {
              specific_snomed_concept_id: HISTORY_TAKING_LIMITED.id,
            },
          },
        ])

        await events.allProcessedForEncounter(db, { patient_encounter_id })
        const inserted_events = (await db.selectFrom('events')
          .selectAll()
          .where('type', '=', 'SinglePositiveFindingAdded')
          .execute())
          .filter((event) => (event.data as { positive_finding_id?: string }).positive_finding_id === finding_id)
        assertMatches(inserted_events, [
          {
            data: {
              workflow: 'triage',
              step: 'brief_history',
              patient_id,
              patient_encounter_id,
              patient_age_determination: 'adult',
              positive_finding_id: finding_id,
              procedure_id: cough.as_part_of_procedure.id,
            },
          },
        ])
      },
    )

    itParallel('reuses the procedure already completed for the referring step', async () => {
      const setup = await setupTriageNewPatient({
        patient_demographics: {},
        warning_signs: asWarningSignsAdult(['Cardiac arrest'], { pregnant: false }),
      })
      const { patient_id, triageRoute } = setup
      const finding_id = generateUUID()

      const [warning_sign_finding] = await patient_findings.findAll(db, { patient_id })
      assert(warning_sign_finding?.as_part_of_procedure)
      assertEquals(warning_sign_finding.as_part_of_procedure.specific_snomed_concept_id, EMERGENCY_EXAMINATION_FOR_TRIAGE.id)

      await postClinicalFindingOk(
        setup,
        { finding_id, s_expression: COUGH },
        { referer: `${route}${triageRoute('warning_signs')}` },
      )

      const this_patient_findings = await patient_findings.findAll(db, { patient_id })
      const cough = this_patient_findings.find((finding) => finding.id === finding_id)
      assert(cough)
      assertEquals(cough.as_part_of_procedure?.id, warning_sign_finding.as_part_of_procedure.id)
      assertEquals(cough.priority, null)
    })

    itParallel('marks the entered_in_error_record_id as entered in error', async () => {
      const setup = await setupTriageNewPatient({ patient_demographics: {} })
      const { patient_id, triageRoute } = setup
      const referer = `${route}${triageRoute('brief_history')}`
      const first_finding_id = generateUUID()
      const second_finding_id = generateUUID()

      await postClinicalFindingOk(setup, { finding_id: first_finding_id, s_expression: COUGH }, { referer })
      await postClinicalFindingOk(
        setup,
        { finding_id: second_finding_id, s_expression: COUGH, entered_in_error_record_id: first_finding_id },
        { referer },
      )

      const still_valid = await patient_findings.findAll(db, { patient_id })
      assertEquals(still_valid.map((finding) => finding.id), [second_finding_id])
    })

    itParallel('responds 400 when the referer is missing', async () => {
      const setup = await setupTriageNewPatient({ patient_demographics: {} })
      await expect400(postClinicalFinding(setup, { finding_id: generateUUID(), s_expression: COUGH }, { referer: null }))
    })

    itParallel('responds 400 when the referer is not a declared step of the current workflow', async () => {
      const setup = await setupTriageNewPatient({ patient_demographics: {} })
      const { openEncounterRoute } = setup
      await expect400(
        postClinicalFinding(setup, { finding_id: generateUUID(), s_expression: COUGH }, {
          referer: `${route}${openEncounterRoute('triage/not_a_step')}`,
        }),
      )
      // A real workflow, but not the one the patient is currently in
      await expect400(
        postClinicalFinding(setup, { finding_id: generateUUID(), s_expression: COUGH }, {
          referer: `${route}${openEncounterRoute('consultation/findings')}`,
        }),
      )
    })

    itParallel('responds 400 when the referer belongs to a different patient', async () => {
      const setup = await setupTriageNewPatient({ patient_demographics: {} })
      const other = await setupTriageNewPatient({ patient_demographics: {} })
      await expect400(
        postClinicalFinding(setup, { finding_id: generateUUID(), s_expression: COUGH }, {
          referer: `${route}${other.triageRoute('warning_signs')}`,
        }),
      )
    })

    itParallel('responds 400 to a negative finding', async () => {
      const setup = await setupTriageNewPatient({ patient_demographics: {} })
      const { triageRoute } = setup
      await expect400(
        postClinicalFinding(setup, { finding_id: generateUUID(), s_expression: NO_COUGH }, {
          referer: `${route}${triageRoute('warning_signs')}`,
        }),
      )
    })
  })
})
