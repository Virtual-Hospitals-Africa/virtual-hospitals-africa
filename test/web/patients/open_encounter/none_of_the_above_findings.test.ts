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
import { getTaskById, TASKS } from '../../../../shared/tasks.ts'
import { isCheckFor } from '../../../../db/models/additional_tasks.ts'
import { inverseSExpression } from '../../../../shared/s_expression_inverse.ts'
import { normalForm } from '../../../../shared/s_expression.ts'
import type { Lang } from '../../../../shared/s_expression_schemas.ts'
import type { ClinicalFindingPostBody } from '../../../../shared/clinical_finding_post.ts'
import sortBy from '../../../../util/sortBy.ts'
import uniq from '../../../../util/uniq.ts'
import generateUUID from '../../../../util/uuid.ts'
import { route } from '../../../_route.ts'

const INSECT_BITE = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
const DIZZINESS = '(clinical_finding (snomed_concept "Dizziness" "finding"))'
const SUDDEN_ONSET_ITCHING = '(clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))'
const EXPOSURE_TO_PEANUT = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))'
const NO_COUGH = '(clinical_finding (snomed_concept "Cough" "finding") (snomed_concept "No" "qualifier value"))'
const CHECK_FOR_ANAPHYLAXIS = 'Check for Anaphylaxis'
const POSSIBLE_ANAPHYLAXIS = '(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)'
const PROBABLE_ANAPHYLAXIS = '(diagnosis (snomed_concept "Anaphylaxis" "disorder") probable)'
const IMPROBABLE_ANAPHYLAXIS = '(diagnosis (snomed_concept "Anaphylaxis" "disorder") improbable)'

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

function uncheckedAnaphylaxisSExpressions(also_recorded: string[] = []): string[] {
  const { to_be_done } = getTaskById(CHECK_FOR_ANAPHYLAXIS)
  const nodes = to_be_done.value as Lang['finding'][]
  const recorded = [...ALREADY_RECORDED, ...also_recorded]
  return uniq(
    nodes
      .filter((node) => node.atom === 'finding')
      .filter((node) => !recorded.includes(node.specific_snomed_concept!.name))
      .map(inverseSExpression),
  )
}

function asLispArray(s_expressions: string[]) {
  return `(${s_expressions.join(' ')})`
}

function warningSignsReferer({ triageRoute }: Setup) {
  return `${route}${triageRoute('warning_signs')}`
}

function postNoneOfTheAbove(
  { nurse, openEncounterRoute }: Setup,
  body: { task_description: string; s_expressions: string },
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
  body: { task_description: string; s_expressions: string },
  opts: { referer: string },
): Promise<{ success: true; records: { id: string; s_expression: string }[] }> {
  const response = await postNoneOfTheAbove(setup, body, opts)
  const json = await response.json()
  assertEquals(response.status, 200, JSON.stringify(json))
  assertEquals(json.success, true)
  assert(Array.isArray(json.records))
  return json
}

// A sign checked on the warning signs page, as the panel would record it
async function postClinicalFindingOk(
  { nurse, openEncounterRoute, triageRoute }: Setup,
  s_expression: string,
) {
  const body: ClinicalFindingPostBody = { finding_id: generateUUID(), s_expression }
  const response = await nurse.fetch(openEncounterRoute('clinical_finding'), {
    method: 'POST',
    body: asFormData(body),
    headers: { Accept: 'application/json', Referer: `${route}${triageRoute('warning_signs')}` },
  })
  const json = await response.json()
  assertEquals(response.status, 200, JSON.stringify(json))
  assertEquals(json, { success: true })
}

async function expect400(response_promise: Promise<Response>) {
  const response = await response_promise
  await response.body?.cancel()
  assertEquals(response.status, 400)
}

type FindingsAddedData = {
  procedure_id?: string
  records: { id: string; existence: string }[]
  task_description_completed?: string
}

function findingsAddedNamingTheTask(patient_encounter_id: string) {
  return db.selectFrom('events')
    .select(['id', 'data'])
    .where('type', '=', 'FindingsAdded')
    .where('patient_encounter_id', '=', patient_encounter_id)
    .orderBy('created_at')
    .execute()
    .then((events) =>
      events
        .map((event) => ({ id: event.id, data: event.data as FindingsAddedData }))
        .filter((event) => event.data.task_description_completed === CHECK_FOR_ANAPHYLAXIS)
    )
}

// What the diagnosis rules said of the submissions that answered the task
async function diagnosisRuleMessages(patient_encounter_id: string): Promise<string[]> {
  const events_naming_the_task = await findingsAddedNamingTheTask(patient_encounter_id)
  assert(events_naming_the_task.length, 'no FindingsAdded named the task')
  const listeners = await db.selectFrom('event_listeners')
    .innerJoin('events', 'events.id', 'event_listeners.event_id')
    .where('event_listeners.event_id', 'in', events_naming_the_task.map((event) => event.id))
    .where('event_listeners.listener_name', '=', 'insertSystemDiagnosesIfNotAlreadyIdentified')
    .select(['event_listeners.success_message', 'event_listeners.error_message'])
    .orderBy('events.created_at')
    .execute()
  assertEquals(listeners.length, events_naming_the_task.length)
  return listeners.map((listener) => {
    assertEquals(listener.error_message, null)
    assert(listener.success_message)
    return listener.success_message
  })
}

/*
  The task evaluations present before the health worker answers. Ruling the diagnosis out can
  itself see the pipeline materialise the task afresh, so only the evaluations that existed
  beforehand are expected to be marked done.
*/
function taskEvaluationIds(patient_encounter_id: string, task_description: string) {
  return db.selectFrom('patient_record_tasks')
    .innerJoin('patient_records', 'patient_records.id', 'patient_record_tasks.id')
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .where('patient_record_tasks.task_id', '=', task_description)
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

function anaphylaxisDiagnoses(patient_id: string, s_expression: string) {
  return patient_evaluations.findAll(db, { patient_id, s_expression })
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
        const { patient_id, patient_encounter_id } = setup
        await events.allProcessedForEncounter(db, { patient_encounter_id })
        const s_expressions = uncheckedAnaphylaxisSExpressions()

        const { records } = await postNoneOfTheAboveOk(
          setup,
          { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
          { referer: warningSignsReferer(setup) },
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

    itParallel('marks the task done and dispatches FindingsAdded naming it, whose diagnosis rules downgrade the possible diagnosis to improbable', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      assertEquals((await anaphylaxisDiagnoses(patient_id, POSSIBLE_ANAPHYLAXIS)).length, 1)
      const s_expressions = uncheckedAnaphylaxisSExpressions()
      const evaluation_ids = await taskEvaluationIds(patient_encounter_id, CHECK_FOR_ANAPHYLAXIS)
      assert(evaluation_ids.length >= 1)

      const { records } = await postNoneOfTheAboveOk(
        setup,
        { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer: warningSignsReferer(setup) },
      )

      const [negative] = await patient_findings.findAll(db, { patient_id, include_negative: true })
        .then((findings) => findings.filter((finding) => finding.id === records[0].id))
      assert(negative?.as_part_of_procedure)
      const procedure_id = negative.as_part_of_procedure.id

      // Marked done by the step procedure the negatives were recorded under
      for (const evaluation_id of evaluation_ids) {
        assertEquals((await doneRelations(procedure_id, evaluation_id)).length, 1)
      }

      const [findings_added, ...others] = await findingsAddedNamingTheTask(patient_encounter_id)
      assertEquals(others, [])
      assertMatches(findings_added.data, { patient_id, patient_encounter_id, patient_age_determination: 'adult', procedure_id })
      assertEquals(
        sortBy(findings_added.data.records, (record) => record.id),
        sortBy(records.map(({ id }) => ({ id, existence: 'No' })), (record) => record.id),
      )

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const [improbable, ...other_improbables] = await anaphylaxisDiagnoses(patient_id, IMPROBABLE_ANAPHYLAXIS)
      assert(improbable, 'the possible anaphylaxis diagnosis was not downgraded to improbable')
      assertEquals(other_improbables, [])
      assertMatches(improbable, { specific_snomed_concept_name: 'Anaphylaxis' })

      // Evidenced by the negative findings that could have made it probable
      assert(improbable.destination_relations.some((relation) =>
        relation.relation_name === 'Evidence of' &&
        relation.displays.full === 'Sudden onset Eruption: No'
      ))

      const [message] = await diagnosisRuleMessages(patient_encounter_id)
      assert(message.endsWith(`Inserted 1 improbable diagnosis(es): ${improbable.id}`), message)
    })

    itParallel('does not record a finding again, nor rule the diagnosis out again, when the task is answered a second time', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      const referer = warningSignsReferer(setup)
      const s_expressions = uncheckedAnaphylaxisSExpressions()
      const evaluation_ids = await taskEvaluationIds(patient_encounter_id, CHECK_FOR_ANAPHYLAXIS)

      const first = await postNoneOfTheAboveOk(
        setup,
        { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer },
      )
      assertEquals(first.records.length, s_expressions.length)
      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // A second click, plus the insect bite already recorded as Yes on the warning signs page
      const second = await postNoneOfTheAboveOk(
        setup,
        { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([...s_expressions, INSECT_BITE]) },
        { referer },
      )
      assertEquals(second.records, [])

      const first_record_ids = new Set(first.records.map((record) => record.id))
      const all_findings = await patient_findings.findAll(db, { patient_id, include_negative: true })
      assertEquals(all_findings.filter((finding) => first_record_ids.has(finding.id)).length, s_expressions.length)

      // The second submission still names the task, so that a finding checked in the meantime is accounted for
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      const events_naming_the_task = await findingsAddedNamingTheTask(patient_encounter_id)
      assertEquals(events_naming_the_task.map((event) => event.data.records), [
        first.records.map(({ id }) => ({ id, existence: 'No' })),
        [],
      ])

      // The second click marks nothing done again, so the evaluations keep the one DONE relation each
      const [negative] = all_findings.filter((finding) => finding.id === first.records[0].id)
      assert(negative?.as_part_of_procedure)
      for (const evaluation_id of evaluation_ids) {
        assertEquals((await doneRelations(negative.as_part_of_procedure.id, evaluation_id)).length, 1)
      }

      // The diagnosis was ruled out once
      assertEquals((await anaphylaxisDiagnoses(patient_id, IMPROBABLE_ANAPHYLAXIS)).length, 1)
      const [first_message, second_message] = await diagnosisRuleMessages(patient_encounter_id)
      assert(first_message.includes('Inserted 1 improbable diagnosis(es)'), first_message)
      assert(second_message.endsWith(`Anaphylaxis is improbable, so not ruled out by task "${CHECK_FOR_ANAPHYLAXIS}"`), second_message)
    })

    itParallel('leaves a probable diagnosis alone when the checks were met before the rest were ruled out', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // Exposure to peanut with sudden onset itching and dizziness makes anaphylaxis probable
      await postClinicalFindingOk(setup, EXPOSURE_TO_PEANUT)
      await postClinicalFindingOk(setup, SUDDEN_ONSET_ITCHING)
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      assertEquals((await anaphylaxisDiagnoses(patient_id, PROBABLE_ANAPHYLAXIS)).length, 1)

      const s_expressions = uncheckedAnaphylaxisSExpressions(['Peanut', 'Itching'])
      await postNoneOfTheAboveOk(
        setup,
        { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer: warningSignsReferer(setup) },
      )
      await events.allProcessedForEncounter(db, { patient_encounter_id })

      assertEquals((await anaphylaxisDiagnoses(patient_id, IMPROBABLE_ANAPHYLAXIS)).length, 0, 'the diagnosis was ruled out even though the checks were met')
      assertEquals((await anaphylaxisDiagnoses(patient_id, PROBABLE_ANAPHYLAXIS)).length, 1)

      const [message] = await diagnosisRuleMessages(patient_encounter_id)
      assert(message.endsWith(`Anaphylaxis is probable, so not ruled out by task "${CHECK_FOR_ANAPHYLAXIS}"`), message)
    })

    itParallel('reevaluates from improbable to probable when a check is met after the rest were ruled out', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const { patient_id, patient_encounter_id } = setup
      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // Everything but exposure to peanut and itching ruled out
      const s_expressions = uncheckedAnaphylaxisSExpressions(['Peanut', 'Itching'])
      await postNoneOfTheAboveOk(
        setup,
        { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray(s_expressions) },
        { referer: warningSignsReferer(setup) },
      )
      await events.allProcessedForEncounter(db, { patient_encounter_id })
      assertEquals((await anaphylaxisDiagnoses(patient_id, IMPROBABLE_ANAPHYLAXIS)).length, 1)

      // Then the health worker learns of the exposure and the itching
      await postClinicalFindingOk(setup, EXPOSURE_TO_PEANUT)
      await postClinicalFindingOk(setup, SUDDEN_ONSET_ITCHING)
      await events.allProcessedForEncounter(db, { patient_encounter_id })

      assertEquals((await anaphylaxisDiagnoses(patient_id, PROBABLE_ANAPHYLAXIS)).length, 1)
      assertEquals((await anaphylaxisDiagnoses(patient_id, IMPROBABLE_ANAPHYLAXIS)).length, 1)
    })

    itParallel('responds 400 when the referer is missing', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      await expect400(
        postNoneOfTheAbove(setup, { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([DIZZINESS]) }, { referer: null }),
      )
    })

    itParallel('responds 400 when an s_expression is not positive', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      await expect400(
        postNoneOfTheAbove(setup, { task_description: CHECK_FOR_ANAPHYLAXIS, s_expressions: asLispArray([NO_COUGH]) }, {
          referer: warningSignsReferer(setup),
        }),
      )
    })

    itParallel('responds 400 when the task is not a check_for task', async () => {
      const setup = await setupWithPossibleAnaphylaxis()
      const link_task = TASKS.find((task) => !isCheckFor(task.to_be_done))
      assert(link_task)
      await expect400(
        postNoneOfTheAbove(setup, { task_description: link_task.description, s_expressions: asLispArray([DIZZINESS]) }, {
          referer: warningSignsReferer(setup),
        }),
      )
    })
  })
})
