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

const COUGH = '(clinical_finding (snomed_concept "Cough" "finding"))'
const CETIRIZINE = '(snomed_concept "Product containing only cetirizine" "medicinal product")'
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
const AMOXICILLIN_CLAVULANIC_ACID = '(medication (snomed_concept "Product containing only amoxicillin and clavulanic acid" "medicinal product") ' +
  '(strength 500 "mg") (strength 125 "mg"))'

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
  const { findings, procedure_id } = await patient_findings.insertMany(db, {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
    employment_id: nurse.employee_id,
    patient_age_determination: 'adult',
    procedure: {
      create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
    },
    findings: [COUGH],
  })
  const cough = findings.find(() => true)
  assert(cough)
  return { nurse, patient_id, patient_encounter_id, procedure_id, finding_id: cough.id }
}

describeParallel('db/models/patient_medications_self_reported.ts', () => {
  afterAll(() => db.destroy())

  itParallel('inserts a medication with only a medicinal product, due to a finding', async () => {
    const { patient_id, patient_encounter_id, finding_id } = await setup()
    const { id } = await patient_medications_self_reported.insertOne(db, {
      patient_id,
      patient_encounter_id,
      finding_id,
      medication_s_expression: JUST_CETIRIZINE,
    })

    const medications = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medications.length, 1)
    const [medication] = medications
    assertEquals(medication.id, id)
    assertEquals(medication.s_expression, JUST_CETIRIZINE)
    assertEquals(medication.display.full, 'cetirizine')
    assertEquals(medication.brand_name, null)
    assertEquals(medication.due_to, { finding_id, name: 'Cough' })
  })

  itParallel('round trips every attribute and the notes', async () => {
    const { patient_id, patient_encounter_id, finding_id } = await setup()
    await patient_medications_self_reported.insertOne(db, {
      patient_id,
      patient_encounter_id,
      finding_id,
      medication_s_expression: FULL_CETIRIZINE,
    })

    const [medication] = await patient_medications_self_reported.findAll(db, { due_to_finding_id: finding_id })
    assertEquals(medication.s_expression, FULL_CETIRIZINE)
    assertEquals(medication.display.short, '10mg cetirizine tablet')
    assertEquals(medication.display.full, '10mg cetirizine tablet, 1 tablet once daily for 5 days')
  })

  itParallel('keeps the order of repeated strengths', async () => {
    const { patient_id, patient_encounter_id, finding_id } = await setup()
    await patient_medications_self_reported.insertOne(db, {
      patient_id,
      patient_encounter_id,
      finding_id,
      medication_s_expression: AMOXICILLIN_CLAVULANIC_ACID,
    })
    const [medication] = await patient_medications_self_reported.findAll(db, { patient_encounter_id })
    assertEquals(medication.s_expression, AMOXICILLIN_CLAVULANIC_ACID)
    assertEquals(medication.display.short, '500mg/125mg amoxicillin + clavulanic acid')
  })

  itParallel('is not returned by patient_findings, though it is a finding', async () => {
    const { patient_id, patient_encounter_id, finding_id } = await setup()
    const { id } = await patient_medications_self_reported.insertOne(db, {
      patient_id,
      patient_encounter_id,
      finding_id,
      medication_s_expression: FULL_CETIRIZINE,
    })

    const findings = await patient_findings.findAll(db, { patient_id, patient_encounter_id })
    assertEquals(findings.map((finding) => finding.id), [finding_id])

    const finding_row = await db.selectFrom('patient_findings').where('id', '=', id).selectAll().executeTakeFirst()
    assert(finding_row, 'The medication is expected to have its own patient_findings row')
  })

  itParallel('cannot be due to a finding of another patient', async () => {
    const [{ finding_id }, other] = await Promise.all([setup(), setup()])
    await assertRejects(() =>
      patient_medications_self_reported.insertOne(db, {
        patient_id: other.patient_id,
        patient_encounter_id: other.patient_encounter_id,
        finding_id,
        medication_s_expression: JUST_CETIRIZINE,
      })
    )
  })

  itParallel('is no longer returned once altered, and idsDueTo finds only valid medications', async () => {
    const { nurse, patient_id, patient_encounter_id, procedure_id, finding_id } = await setup()
    const [kept, altered] = await Promise.all([generateUUID(), generateUUID()].map((id) =>
      patient_medications_self_reported.insertOne(db, {
        id,
        patient_id,
        patient_encounter_id,
        finding_id,
        medication_s_expression: JUST_CETIRIZINE,
      })
    ))
    assertEquals(
      new Set(await patient_medications_self_reported.idsDueTo(db, { finding_ids: [finding_id] })),
      new Set([kept.id, altered.id]),
    )

    await markAltered(db, {
      patient_id,
      patient_encounter_id,
      employment_id: nurse.employee_id,
      procedure_id,
      altered_record_ids: [altered.id],
    })

    assertEquals(await patient_medications_self_reported.idsDueTo(db, { finding_ids: [finding_id] }), [kept.id])
    const medications = await patient_medications_self_reported.findAll(db, { patient_id })
    assertEquals(medications.map((medication) => medication.id), [kept.id])
  })
})
