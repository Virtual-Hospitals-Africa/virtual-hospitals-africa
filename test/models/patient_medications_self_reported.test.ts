import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { patient_medications_self_reported } from '../../db/models/patient_medications_self_reported.ts'
import { markAltered } from '../../db/models/patient_records_base.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import generateUUID from '../../util/uuid.ts'

const DIABETES = '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))'
const NO_ASTHMA = '(clinical_finding (snomed_concept "Asthma" "disorder") (snomed_concept "No" "qualifier value"))'
const CETIRIZINE = '(snomed_concept "Product containing only cetirizine" "medicinal product")'
const METFORMIN = '(snomed_concept "Product containing only metformin" "medicinal product")'
const JUST_CETIRIZINE = `(medication ${CETIRIZINE})`
const FULL_CETIRIZINE = `(medication ${CETIRIZINE} ` +
  '(form (snomed_concept "Tablet" "basic dose form")) ' +
  '(route (snomed_concept "Oral" "intended site")) ' +
  '(strength 10 "mg") ' +
  '(dosage 1 "tablet") ' +
  '(frequency (snomed_concept "Once daily" "qualifier value")) ' +
  '(duration 5 "days") ' +
  '(started "2026-11-01") ' +
  '(notes "Taken at night, says \\"it helps\\""))'
const METFORMIN_FOR_DIABETES = `(medication ${METFORMIN} (taken_for (snomed_concept "Diabetes mellitus" "disorder")))`
const AMOXICILLIN_CLAVULANIC_ACID = '(medication (snomed_concept "Product containing only amoxicillin and clavulanic acid" "medicinal product") ' +
  '(strength 500 "mg") (strength 125 "mg"))'

// A patient on record as having diabetes and not having asthma
async function setup() {
  const clinic = await createTestOrganization(db)
  const nurse = await addTestEmployee(db, { role: 'nurse', organization_id: clinic.id })
  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    nurse.organization_id,
    { employment_id: nurse.employee_id },
  )
  const patient_id = encounter.patient.id
  const { patient_encounter_id } = encounter
  const { patient_encounter_employee_id } = encounter.employee
  const { findings, procedure_id } = await patient_findings.insertMany(db, {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    employment_id: nurse.employee_id,
    patient_age_determination: 'adult',
    procedure: {
      create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.brief_history.snomed_concept_id,
    },
    findings: [DIABETES, NO_ASTHMA],
  })
  const diabetes = findings.find((finding) => finding.existence === 'Yes')
  assert(diabetes)
  const insert = { patient_id, patient_encounter_id, patient_encounter_employee_id, procedure_id }
  return { nurse, patient_id, patient_encounter_id, procedure_id, diabetes_id: diabetes.id, finding_ids: findings.map((finding) => finding.id), insert }
}

describeParallel('db/models/patient_medications_self_reported.ts', () => {
  afterAll(() => db.destroy())

  itParallel('inserts a medication that is only a medicinal product, taken for nothing in particular', async () => {
    const { patient_id, insert } = await setup()
    const { id } = await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: JUST_CETIRIZINE })

    const medications = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medications.length, 1)
    const [medication] = medications
    assertEquals(medication.id, id)
    assertEquals(medication.s_expression, JUST_CETIRIZINE)
    assertEquals(medication.display.full, 'cetirizine')
    assertEquals(medication.brand_name, null)
    assertEquals(medication.due_to, null)
  })

  itParallel('round trips every attribute and the notes', async () => {
    const { patient_encounter_id, insert } = await setup()
    await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: FULL_CETIRIZINE })

    const [medication] = await patient_medications_self_reported.findAll(db, { patient_encounter_id })
    assertEquals(medication.s_expression, FULL_CETIRIZINE)
    assertEquals(medication.display.short, '10mg cetirizine tablet')
    assertEquals(medication.display.full, '10mg cetirizine tablet, 1 tablet once daily for 5 days')
  })

  itParallel('keeps the order of repeated strengths', async () => {
    const { patient_encounter_id, insert } = await setup()
    await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: AMOXICILLIN_CLAVULANIC_ACID })
    const [medication] = await patient_medications_self_reported.findAll(db, { patient_encounter_id })
    assertEquals(medication.s_expression, AMOXICILLIN_CLAVULANIC_ACID)
    assertEquals(medication.display.short, '500mg/125mg amoxicillin + clavulanic acid')
  })

  itParallel('relates a medication to the record of the condition it is taken for', async () => {
    const { patient_id, diabetes_id, insert } = await setup()
    await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: METFORMIN_FOR_DIABETES })

    const [medication] = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medication.due_to, { record_id: diabetes_id, name: 'Diabetes mellitus', category: 'disorder' })
    assertEquals(medication.s_expression, METFORMIN_FOR_DIABETES)
  })

  itParallel('cannot be taken for a condition the patient is not on record as having', async () => {
    const [{ insert }, other] = await Promise.all([setup(), setup()])

    // Recorded as not having asthma
    await assertRejects(
      () =>
        patient_medications_self_reported.insertOne(db, {
          ...insert,
          medication_s_expression: `(medication ${CETIRIZINE} (taken_for (snomed_concept "Asthma" "disorder")))`,
        }),
      Error,
      'The patient has no record of Asthma',
    )
    // Never asked about epilepsy
    await assertRejects(
      () =>
        patient_medications_self_reported.insertOne(db, {
          ...insert,
          medication_s_expression: `(medication ${CETIRIZINE} (taken_for (snomed_concept "Epilepsy" "disorder")))`,
        }),
      Error,
      'The patient has no record of Epilepsy',
    )
    assertEquals(await patient_medications_self_reported.findAll(db, { patient_id: insert.patient_id }), [])
    assertEquals(await patient_medications_self_reported.findAll(db, { patient_id: other.patient_id }), [])
  })

  itParallel('no longer says what it is taken for once that record is altered, but stays a medication', async () => {
    const { nurse, patient_id, patient_encounter_id, procedure_id, diabetes_id, insert } = await setup()
    await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: METFORMIN_FOR_DIABETES })

    await markAltered(db, {
      patient_id,
      patient_encounter_id,
      employment_id: nurse.employee_id,
      procedure_id,
      altered_record_ids: [diabetes_id],
    })

    const [medication] = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medication.due_to, null)
    assertEquals(medication.s_expression, `(medication ${METFORMIN})`)
  })

  itParallel('is not returned by patient_findings unless asked for, though it is a finding', async () => {
    const { patient_id, patient_encounter_id, procedure_id, finding_ids, insert } = await setup()
    const { id } = await patient_medications_self_reported.insertOne(db, { ...insert, medication_s_expression: FULL_CETIRIZINE })

    const findings = await patient_findings.findAll(db, { patient_id, patient_encounter_id, include_negative: true })
    assertEquals(new Set(findings.map((finding) => finding.id)), new Set(finding_ids))

    const only_medications = await patient_findings.findAll(db, { patient_id, self_reported_medications: 'only' })
    assertEquals(only_medications.map((finding) => finding.id), [id])
    const [as_finding] = only_medications
    assertEquals(as_finding.displays.full, '10mg cetirizine tablet, 1 tablet once daily for 5 days')
    assertEquals(as_finding.as_part_of_procedure?.id, procedure_id)
  })

  itParallel('is no longer returned once altered', async () => {
    const { nurse, patient_id, patient_encounter_id, procedure_id, insert } = await setup()
    const [kept, altered] = await Promise.all(
      [generateUUID(), generateUUID()].map((id) =>
        patient_medications_self_reported.insertOne(db, { ...insert, id, medication_s_expression: JUST_CETIRIZINE })
      ),
    )

    await markAltered(db, {
      patient_id,
      patient_encounter_id,
      employment_id: nurse.employee_id,
      procedure_id,
      altered_record_ids: [altered.id],
    })

    const medications = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medications.map((medication) => medication.id), [kept.id])
    const every_medication = await patient_medications_self_reported.findAll(db, { patient_id, include_invalid: true })
    assertEquals(every_medication.length, 2)
  })
})
