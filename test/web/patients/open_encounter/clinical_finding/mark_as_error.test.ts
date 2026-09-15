import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { asWarningSignsAdult, setupTriageNewPatient } from '../triage/_setup.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { events } from '../../../../../db/models/events.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import generateUUID from '../../../../../util/uuid.ts'
import { ENTERED_IN_ERROR, EVALUATION_ACTION } from '../../../../../shared/snomed_concepts.ts'
import { route } from '../../../../_route.ts'

type Setup = Awaited<ReturnType<typeof setupTriageNewPatient>>

function setupWithCardiacArrest() {
  return setupTriageNewPatient({
    patient_demographics: {},
    warning_signs: asWarningSignsAdult(['Cardiac arrest'], { pregnant: false }),
  })
}

function postMarkAsError(
  { nurse, openEncounterRoute }: Setup,
  record_id: string,
  { referer }: { referer: string | null },
) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (referer) headers.Referer = referer
  return nurse.fetch(openEncounterRoute(`clinical_finding/${record_id}/mark_as_error`), {
    method: 'POST',
    headers,
  })
}

async function postMarkAsErrorOk(setup: Setup, record_id: string, opts: { referer: string }) {
  const response = await postMarkAsError(setup, record_id, opts)
  const json = await response.json()
  assertEquals(response.status, 200, JSON.stringify(json))
  assertEquals(json, { success: true })
}

async function expect400(response_promise: Promise<Response>) {
  const response = await response_promise
  await response.body?.cancel()
  assertEquals(response.status, 400)
}

/* The only positive finding recorded by setupWithCardiacArrest */
async function onlyPositiveFinding(patient_id: string) {
  const findings = await patient_findings.findAll(db, { patient_id })
  const positive = findings.filter((finding) => finding.existence === 'Yes')
  assertEquals(positive.length, 1)
  assert(positive[0].as_part_of_procedure)
  return positive[0]
}

function enteredInErrorEvaluationsOf(evaluates_record_id: string) {
  return db.selectFrom('patient_evaluations')
    .innerJoin('patient_records', 'patient_records.id', 'patient_evaluations.id')
    .where('patient_evaluations.evaluates_record_id', '=', evaluates_record_id)
    .where('patient_records.specific_snomed_concept_id', '=', ENTERED_IN_ERROR.id)
    .select([
      'patient_evaluations.id',
      'patient_evaluations.procedure_id',
      'patient_evaluations.employment_id',
      'patient_evaluations.by_system',
      'patient_records.root_snomed_concept_id',
    ])
    .execute()
}

describeParallel('/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/clinical_finding/[record_id]/mark_as_error', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('POST', () => {
    itParallel(
      'marks a previously entered finding as entered in error under the referring step procedure and dispatches SingleFindingMarkedAsError',
      async () => {
        const setup = await setupWithCardiacArrest()
        const { patient_id, patient_encounter_id, triageRoute } = setup

        const cardiac_arrest = await onlyPositiveFinding(patient_id)
        const procedure_id = cardiac_arrest.as_part_of_procedure!.id

        await postMarkAsErrorOk(setup, cardiac_arrest.id, {
          referer: `${route}${triageRoute('warning_signs')}`,
        })

        const still_valid = await patient_findings.findAll(db, { patient_id })
        assertEquals(still_valid.filter((finding) => finding.id === cardiac_arrest.id), [])

        assertMatches(await enteredInErrorEvaluationsOf(cardiac_arrest.id), [
          {
            procedure_id,
            by_system: false,
            root_snomed_concept_id: EVALUATION_ACTION.id,
          },
        ])

        await events.allProcessedForEncounter(db, { patient_encounter_id })
        const inserted_event = await db.selectFrom('events')
          .selectAll()
          .where('type', '=', 'SingleFindingMarkedAsError')
          .where('patient_encounter_id', '=', patient_encounter_id)
          .executeTakeFirstOrThrow()

        assertMatches(
          inserted_event,
          {
            data: {
              workflow: 'triage',
              step: 'warning_signs',
              patient_id,
              patient_encounter_id,
              patient_age_determination: 'adult',
              procedure_id,
              altered_record_id: cardiac_arrest.id,
            },
          },
        )
      },
    )

    itParallel('responds 400 when the record has already been marked as entered in error', async () => {
      const setup = await setupWithCardiacArrest()
      const { patient_id, triageRoute } = setup
      const referer = `${route}${triageRoute('warning_signs')}`

      const cardiac_arrest = await onlyPositiveFinding(patient_id)

      await postMarkAsErrorOk(setup, cardiac_arrest.id, { referer })
      await expect400(postMarkAsError(setup, cardiac_arrest.id, { referer }))

      // The second attempt inserted no further evaluation
      assertEquals((await enteredInErrorEvaluationsOf(cardiac_arrest.id)).length, 1)
    })

    itParallel('responds 400 when the record belongs to a different patient', async () => {
      const setup = await setupWithCardiacArrest()
      const other = await setupWithCardiacArrest()
      const { triageRoute } = setup

      const other_patients_finding = await onlyPositiveFinding(other.patient_id)

      await expect400(postMarkAsError(setup, other_patients_finding.id, {
        referer: `${route}${triageRoute('warning_signs')}`,
      }))

      assertEquals(await enteredInErrorEvaluationsOf(other_patients_finding.id), [])
    })

    itParallel('responds 400 when there is no such record', async () => {
      const setup = await setupWithCardiacArrest()
      const { triageRoute } = setup
      await expect400(postMarkAsError(setup, generateUUID(), {
        referer: `${route}${triageRoute('warning_signs')}`,
      }))
    })

    itParallel('responds 400 when no procedure has been completed for the referring step', async () => {
      const setup = await setupWithCardiacArrest()
      const { patient_id, triageRoute } = setup

      const cardiac_arrest = await onlyPositiveFinding(patient_id)

      // brief_history is a triage step, but this patient has not gotten there yet
      await expect400(postMarkAsError(setup, cardiac_arrest.id, {
        referer: `${route}${triageRoute('brief_history')}`,
      }))

      assertEquals(await enteredInErrorEvaluationsOf(cardiac_arrest.id), [])
    })

    itParallel('responds 400 when the referer is missing', async () => {
      const setup = await setupWithCardiacArrest()
      const cardiac_arrest = await onlyPositiveFinding(setup.patient_id)
      await expect400(postMarkAsError(setup, cardiac_arrest.id, { referer: null }))
    })

    itParallel('responds 400 when the referer is not a declared step of the current workflow', async () => {
      const setup = await setupWithCardiacArrest()
      const { openEncounterRoute } = setup
      const cardiac_arrest = await onlyPositiveFinding(setup.patient_id)

      await expect400(postMarkAsError(setup, cardiac_arrest.id, {
        referer: `${route}${openEncounterRoute('triage/not_a_step')}`,
      }))

      // A real workflow, but not the one the patient is currently in
      await expect400(postMarkAsError(setup, cardiac_arrest.id, {
        referer: `${route}${openEncounterRoute('consultation/findings')}`,
      }))
    })
  })
})
