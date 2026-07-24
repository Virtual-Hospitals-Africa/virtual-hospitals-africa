import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import type { TestEmployee } from '../../mocks/testEmployee.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { patient_history } from '../../db/models/patient_history.ts'
import { ALLERGIC_CONDITION, PROCEDURE } from '../../shared/snomed_concepts.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'

// Concepts used below are real descendants of each history anchor in the SNOMED
// data loaded into the test database (see db/models/patient_history.ts anchors).
const CHRONIC_KIDNEY_DISEASE = '709044004' // descendant of chronic disease
const FAMILY_HISTORY_PREMATURE_CHD = '134439009' // descendant of Family history with explicit context
const HISTORY_OF_MAJOR_ABDOMINAL_SURGERY = '161617006' // descendant of History of surgery
const HISTORY_OF_INSULIN_THERAPY = '161649006' // descendant of History of drug therapy
const NON_SMOKER = '8392000' // descendant of Health-related behavior finding
const PRESCRIPTION_OF_DRUG = '33633005'

async function setup() {
  const clinic = await createTestOrganization(db)
  const nurse = await addTestEmployee(db, {
    role: 'nurse',
    organization_id: clinic.id,
  })
  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    nurse.organization_id,
    { employment_id: nurse.employee_id },
  )
  return { nurse, encounter, patient_id: encounter.patient.id }
}

// Records a finding for the patient (findings must hang off a procedure).
async function insertHistoryFinding(
  { nurse, encounter }: Awaited<ReturnType<typeof setup>>,
  finding: string,
) {
  const procedure = await patient_procedures.insertOneNested(db, {
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    employment_id: nurse.employee_id,
    procedure: parseExpressionExpectingAtom(
      `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals.s_expression})`,
      'procedure',
    ),
  })
  return patient_findings.insertOneNested(db, {
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
    procedure_id: procedure.procedure_id,
    finding,
  })
}

function getHistory(
  { nurse, patient_id }: { nurse: TestEmployee; patient_id: string },
) {
  return patient_history.get(db, { patient_id, health_worker_id: nurse.id })
}

describeParallel('db/models/patient_history.ts', () => {
  afterAll(() => db.destroy())

  describeParallel('allergies', () => {
    itParallel('pulls in findings matching the (allergy) s-expression', async () => {
      const ctx = await setup()
      await insertHistoryFinding(ctx, '(allergy)')

      const history = await getHistory(ctx)

      assertEquals(history.allergies.length, 1)
      assertEquals(
        history.allergies[0].specific_snomed_concept_id,
        ALLERGIC_CONDITION.id,
      )
    })
  })

  describeParallel('pre_existing_conditions', () => {
    itParallel('pulls in findings that are descendants of chronic disease', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "Chronic kidney disease" "disorder"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.pre_existing_conditions.length, 1)
      assertEquals(
        history.pre_existing_conditions[0].specific_snomed_concept_id,
        CHRONIC_KIDNEY_DISEASE,
      )
    })

    itParallel('does not pull in non-chronic findings', async () => {
      const ctx = await setup()
      // Broken arm is a finding but not a chronic disease.
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "Closed fracture of bone" "disorder"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.pre_existing_conditions.length, 0)
    })
  })

  describeParallel('family_history', () => {
    itParallel('pulls in findings under Family history with explicit context', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "Family history: premature coronary heart disease" "situation"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.family_history.length, 1)
      assertEquals(
        history.family_history[0].specific_snomed_concept_id,
        FAMILY_HISTORY_PREMATURE_CHD,
      )
    })
  })

  describeParallel('major_surgeries', () => {
    itParallel('pulls in findings under History of surgery', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "History of major abdominal surgery" "situation"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.major_surgeries.length, 1)
      assertEquals(
        history.major_surgeries[0].specific_snomed_concept_id,
        HISTORY_OF_MAJOR_ABDOMINAL_SURGERY,
      )
    })
  })

  describeParallel('lifestyle', () => {
    itParallel('pulls in findings under Health-related behavior finding', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "Non-smoker" "finding"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.lifestyle.length, 1)
      assertEquals(history.lifestyle[0].specific_snomed_concept_id, NON_SMOKER)
    })
  })

  describeParallel('medications', () => {
    itParallel('pulls in self-reported medication findings (under History of drug therapy)', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "History of insulin therapy" "situation"))',
      )

      const history = await getHistory(ctx)

      assertEquals(history.medications.length, 1)
      const [medication] = history.medications
      assertEquals(medication.type, 'finding')
      assertEquals(
        medication.specific_snomed_concept_id,
        HISTORY_OF_INSULIN_THERAPY,
      )
    })

    itParallel('pulls in prescriptions as procedures', async () => {
      const ctx = await setup()

      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: ctx.patient_id,
        patient_encounter_id: ctx.encounter.patient_encounter_id,
        employment_id: ctx.nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression} (snomed_concept "Prescription of drug" "procedure"))`,
          'procedure',
        ),
      })
      // A prescription is a procedure with a signature row.
      await db.insertInto('patient_prescription_signatures')
        .values({ id: procedure.procedure_id })
        .execute()

      const history = await getHistory(ctx)

      assertEquals(history.medications.length, 1)
      const [medication] = history.medications
      assertEquals(medication.type, 'procedure')
      assertEquals(medication.specific_snomed_concept_id, PRESCRIPTION_OF_DRUG)
    })

    itParallel('unions self-reported findings and prescriptions', async () => {
      const ctx = await setup()
      await insertHistoryFinding(
        ctx,
        '(clinical_finding (snomed_concept "History of insulin therapy" "situation"))',
      )
      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: ctx.patient_id,
        patient_encounter_id: ctx.encounter.patient_encounter_id,
        employment_id: ctx.nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression} (snomed_concept "Prescription of drug" "procedure"))`,
          'procedure',
        ),
      })
      await db.insertInto('patient_prescription_signatures')
        .values({ id: procedure.procedure_id })
        .execute()

      const history = await getHistory(ctx)

      assertEquals(history.medications.length, 2)
      assert(history.medications.some((m) => m.type === 'finding'))
      assert(history.medications.some((m) => m.type === 'procedure'))
    })
  })
})
