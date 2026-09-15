import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { asWarningSignsAdult, setupTriageNewPatient } from './triage/_setup.ts'
import { patient_findings } from '../../../../db/models/patient_findings.ts'
import { patient_evaluations } from '../../../../db/models/patient_evaluations.ts'
import { events } from '../../../../db/models/events.ts'
import { assertMatches } from '../../../../util/assertMatches.ts'
import asFormData from '../../../../util/asFormData.ts'
import { DONE, EMERGENCY_EXAMINATION_FOR_TRIAGE } from '../../../../shared/snomed_concepts.ts'
import { getTaskById } from '../../../../shared/tasks.ts'
import { inverseSExpression } from '../../../../shared/s_expression_inverse.ts'
import { normalForm } from '../../../../shared/s_expression.ts'
import type { Lang } from '../../../../shared/s_expression_schemas.ts'
import sortBy from '../../../../util/sortBy.ts'
import uniq from '../../../../util/uniq.ts'
import { route } from '../../../_route.ts'

const INSECT_BITE = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
const DIZZINESS = '(clinical_finding (snomed_concept "Dizziness" "finding"))'
const NO_COUGH = '(clinical_finding (snomed_concept "Cough" "finding") (snomed_concept "No" "qualifier value"))'
const CHECK_FOR_ANAPHYLAXIS = 'Check for Anaphylaxis'

type Setup = Awaited<ReturnType<typeof setupTriageNewPatient>>

/*
  Insect bite and dizziness together make anaphylaxis a possible diagnosis, which is what
  prompts the "Check for Anaphylaxis" task. Both are recorded on the warning signs page, so
  the panel would list the remaining check_for findings of that task as unchecked.
*/
function setupWithPossibleAnaphylaxis() {
  return setupTriageNewPatient({
    patient_demographics: {},
    warning_signs: asWarningSignsAdult([], { pregnant: false }, INSECT_BITE, DIZZINESS),
  })
}

/*
  The check_for findings of the task without a record yet, as the panel would send them.
  Abdominal pain is itself an adult warning sign, so the warning signs page has already
  recorded it as No. The task lists peanut twice, so the route records it once.
*/
const ALREADY_RECORDED = ['Insect bite - wound', 'Dizziness', 'Abdominal pain']

function uncheckedAnaphylaxisSExpressions(): string[] {
  const { to_be_done } = getTaskById(CHECK_FOR_ANAPHYLAXIS)
  const nodes = to_be_done.value as Lang['finding'][]
  return uniq(
    nodes
      .filter((node) => node.atom === 'finding')
      .filter((node) => !ALREADY_RECORDED.includes(node.specific_snomed_concept!.name))
      .map(inverseSExpression),
  )
}

function asLispArray(s_expressions: string[]) {
  return `(${s_expressions.join(' ')})`
}

function postNoneOfTheAbove(
  { nurse, openEncounterRoute }: Setup,
  body: { task_id: string; s_expressions: string },
  { referer }: { referer: string | null },
) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (referer) headers.Referer = referer
  return nurse.fetch(openEncounterRoute('none_of_the_above_findings'), {
    method: 'POST',
    body: asFormData(body),
    headers,
  })
}

async function postNoneOfTheAboveOk(
  setup: Setup,
  body: { task_id: string; s_expressions: string },
  opts: { referer: string },
): Promise<{ success: true; records: { id: string; s_expression: string }[] }> {
  const response = await postNoneOfTheAbove(setup, body, opts)
  const json = await response.json()
  assertEquals(response.status, 200, JSON.stringify(json))
  assertEquals(json.success, true)
  assert(Array.isArray(json.records))
  return json
}

async function expect400(response_promise: Promise<Response>) {
  const response = await response_promise
  await response.body?.cancel()
  assertEquals(response.status, 400)
}

/*
  The task evaluations present before the health worker answers. Marking the task done can
  itself downgrade a diagnosis, after which the pipeline materialises the task afresh, so
  only the evaluations that existed beforehand are expected to be marked done.
*/
function taskEvaluationIds(patient_encounter_id: string, task_id: string) {
  return db.selectFrom('patient_record_tasks')
    .innerJoin('patient_records', 'patient_records.id', 'patient_record_tasks.id')
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .where('patient_record_tasks.task_id', '=', task_id)
    .select('patient_record_tasks.id')
    .execute()
    .then((rows) => rows.map(({ id }) => id))
}

function doneRelations(procedure_id: string, evaluation_id: string) {
  return db.selectFrom('patient_record_relations')
    .innerJoin('patient_records', 'patient_records.id', 'patient_record_relations.id')
    .where('patient_record_relations.source_id', '=', procedure_id)
    .where('patient_record_relations.destination_id', '=', evaluation_id)
    .where('patient_records.specific_snomed_concept_id', '=', DONE.id)
    .select('patient_record_relations.id')
    .execute()
}

describeParallel('/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/none_of_the_above_findings', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('POST', () => {
    itParallel(
      'records each s_expression as a negative finding under the referring step procedure and responds with the record ids',
      async () => {
        const setup = await setupWithPossibleAnaphylaxis()
        const { patient_id, patient_encounter_id, triageRoute } = setup
        await events.allProcessedForEncounter(db, { patient_encounter_id })
        const s_expressions = uncheckedAnaphylaxisSExpressions()

        const { records } = await postNoneOfTheAboveOk(
          setup,
          { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
          { referer: `${route}${triageRoute('warning_signs')}` },
        )

        assertEquals(sortBy(records.map((record) => record.s_expression), (s) => s), sortBy(s_expressions.map(normalForm), (s) => s))

        // The warning signs page records every unchecked sign as No too, so look only at the records returned
        const all_findings = await patient_findings.findAll(db, { patient_id, include_negative: true })
        const record_ids = new Set(records.map((record) => record.id))
        const recorded = all_findings.filter((finding) => record_ids.has(finding.id))
        assertEquals(recorded.length, records.length)
        for (const finding of recorded) {
          assertMatches(finding, {
            patient_encounter_id,
            existence: 'No',
            as_part_of_procedure: { specific_snomed_concept_id: EMERGENCY_EXAMINATION_FOR_TRIAGE.id },
          })
        }
      },
    )

    itParallel('dispatches NoneOfTheAboveFindings whose listener marks the task done and downgrades the possible diagnosis', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id, triageRoute } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      const s_expressions = uncheckedAnaphylaxisSExpressions()
      const evaluation_ids = await taskEvaluationIds(patient_encounter_id, CHECK_FOR_ANAPHYLAXIS)
      assert(evaluation_ids.length >= 1)

      const { records } = await postNoneOfTheAboveOk(
        setup,
        { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer: `${route}${triageRoute('warning_signs')}` },
      )

      const [negative] = await patient_findings.findAll(db, { patient_id, include_negative: true })
        .then((findings) => findings.filter((finding) => finding.id === records[0].id))
      assert(negative?.as_part_of_procedure)
      const procedure_id = negative.as_part_of_procedure.id

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const inserted_events = (await db.selectFrom('events')
        .selectAll()
        .where('type', '=', 'NoneOfTheAboveFindings')
        .execute())
        .filter((event) => (event.data as { patient_encounter_id?: string }).patient_encounter_id === patient_encounter_id)
      assertMatches(inserted_events, [
        {
          data: {
            workflow: 'triage',
            step: 'warning_signs',
            patient_id,
            patient_encounter_id,
            patient_age_determination: 'adult',
            procedure_id,
            task_id: CHECK_FOR_ANAPHYLAXIS,
            negative_finding_ids: records.map((record) => record.id),
          },
        },
      ])

      for (const evaluation_id of evaluation_ids) {
        assertEquals((await doneRelations(procedure_id, evaluation_id)).length, 1)
      }

      const improbable = await patient_evaluations.findOne(db, {
        patient_id,
        s_expression: '(diagnosis (snomed_concept "Anaphylaxis" "disorder") improbable)',
      })
      assertMatches(improbable, { specific_snomed_concept_name: 'Anaphylaxis' })
    })

    itParallel('does not record a finding again when it already has a record in this encounter', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id, triageRoute } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      const referer = `${route}${triageRoute('warning_signs')}`
      const s_expressions = uncheckedAnaphylaxisSExpressions()

      const first = await postNoneOfTheAboveOk(
        setup,
        { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer },
      )
      assertEquals(first.records.length, s_expressions.length)

      // A second click, plus the insect bite already recorded as Yes on the warning signs page
      const second = await postNoneOfTheAboveOk(
        setup,
        { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([...s_expressions, INSECT_BITE]) },
        { referer },
      )
      assertEquals(second.records, [])

      const first_record_ids = new Set(first.records.map((record) => record.id))
      const all_findings = await patient_findings.findAll(db, { patient_id, include_negative: true })
      assertEquals(all_findings.filter((finding) => first_record_ids.has(finding.id)).length, s_expressions.length)

      // The task may still need marking done, so the event is dispatched regardless
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      const inserted_events = (await db.selectFrom('events')
        .select('data')
        .where('type', '=', 'NoneOfTheAboveFindings')
        .orderBy('created_at')
        .execute())
        .filter((event) => (event.data as { patient_encounter_id?: string }).patient_encounter_id === patient_encounter_id)
      assertMatches(inserted_events, [
        { data: { negative_finding_ids: first.records.map((record) => record.id) } },
        { data: { negative_finding_ids: [] } },
      ])
    })

    itParallel('responds 400 when the referer is missing', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      await expect400(
        postNoneOfTheAbove(setup, { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([DIZZINESS]) }, { referer: null }),
      )
    })

    itParallel('responds 400 when an s_expression is not positive', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      await expect400(
        postNoneOfTheAbove(setup, { task_id: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([NO_COUGH]) }, {
          referer: `${route}${setup.triageRoute('warning_signs')}`,
        }),
      )
    })

    itParallel('responds 400 when the task is not a check_for task', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      await expect400(
        postNoneOfTheAbove(setup, { task_id: 'Not a task', s_expressions: asLispArray([DIZZINESS]) }, {
          referer: `${route}${setup.triageRoute('warning_signs')}`,
        }),
      )
    })
  })
})
