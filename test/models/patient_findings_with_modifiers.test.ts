import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../db/db.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { patient_findings_with_modifiers } from '../../db/models/patient_findings_with_modifiers.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { PROCEDURE } from '../../shared/snomed_concepts.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'

/*
  Modifiers are derived purely from the finding's specific SNOMED concept:
  - predefined_attributes: the concept's own non-IS_A relationships in the SNOMED graph
  - relevant_qualifiers: qualifiers from due_to rules on the concept or any of its ancestors
  - onset_required: whether a due_to_event_time_comparisons rule exists on the concept or any of its ancestors
*/
async function insertFindingForTest(s_expression: string) {
  const clinic = await createTestOrganization(db)
  const nurse = await addTestEmployee(db, {
    role: 'nurse',
    organization_id: clinic.id,
  })

  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    nurse.organization_id,
    {
      employment_id: nurse.employee_id,
    },
  )

  const procedure = await patient_procedures.insertOneNested(db, {
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    employment_id: nurse.employee_id,
    procedure: parseExpressionExpectingAtom(
      `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals.s_expression})`,
      'procedure',
    ),
  })

  const { finding_id, inserted_new } = await patient_findings.insertOneNested(db, {
    patient_id: encounter.patient.id,
    patient_encounter_id: encounter.patient_encounter_id,
    patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
    procedure_id: procedure.procedure_id,
    finding: s_expression,
  })
  assert(inserted_new)

  return patient_findings_with_modifiers.getById(db, finding_id)
}

function qualifier(name: string, category = 'qualifier value') {
  return { s_expression: `(qualifier (snomed_concept "${name}" "${category}"))` }
}

function attribute(
  attribute_name: string,
  value_name: string,
  value_category: string,
) {
  return {
    s_expression: `(attribute (snomed_concept "${attribute_name}" "attribute") (snomed_concept "${value_name}" "${value_category}"))`,
  }
}

const CONSTIPATION_ATTRIBUTES = [
  attribute('Finding site', 'Intestinal structure', 'body structure'),
  attribute('Has interpretation', 'Altered', 'qualifier value'),
  attribute('Interprets', 'Bowel action', 'observable entity'),
]

const HEADACHE_QUALIFIERS = [
  qualifier('Severe (severity modifier)'),
  qualifier('Sudden onset'),
]

const SWELLING_QUALIFIERS = [
  qualifier('Entire'),
  qualifier('New'),
  qualifier('Pain', 'finding'),
  qualifier('Red color'),
  qualifier('Sudden onset'),
]

describeParallel('db/models/patient_findings_with_modifiers.ts', () => {
  afterAll(() => db.destroy())

  itParallel('Constipation requires an onset because a rule compares its onset against a duration', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Constipation" "finding"))',
    )

    assertEquals(finding.displays.full, 'Constipation')
    assertEquals(finding.onset_required, true)
    assertEquals(finding.relevant_qualifiers, [])
    assertEquals(finding.predefined_attributes, CONSTIPATION_ATTRIBUTES)
  })

  itParallel('onset_required stays true for Constipation even once an onset has been recorded', async () => {
    const finding = await insertFindingForTest(`
      (clinical_finding
        (snomed_concept "Constipation" "finding")
        (event (snomed_concept "Time of onset" "observable entity") "2025-12-28 19:51:18-05"))
    `)

    assertEquals(finding.onset_required, true)
    assertEquals(finding.attributes.map((a) => a.displays.finding), ['Time of onset'])
  })

  itParallel('a descendant of Constipation inherits onset_required but reports its own predefined attributes', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Chronic constipation" "disorder"))',
    )

    assertEquals(finding.onset_required, true)
    assertEquals(finding.relevant_qualifiers, [])
    assertEquals(finding.predefined_attributes, [
      attribute('Clinical course', 'Chronic', 'qualifier value'),
      attribute('Finding site', 'Intestinal structure', 'body structure'),
      attribute('Has interpretation', 'Altered', 'qualifier value'),
      attribute('Interprets', 'Bowel action', 'observable entity'),
      attribute('Interprets', 'Gastrointestinal tract function', 'observable entity'),
    ])
  })

  itParallel('an ancestor of Constipation does not require an onset', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Altered bowel function" "finding"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, [])
    // Shares its SNOMED relationships with Constipation, but that is a property of the graph, not of any rule
    assertEquals(finding.predefined_attributes, CONSTIPATION_ATTRIBUTES)
  })

  itParallel('Unable to break wind requires an onset without sharing any ancestry with Constipation below Clinical finding', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Unable to break wind" "finding"))',
    )

    assertEquals(finding.onset_required, true)
    assertEquals(finding.relevant_qualifiers, [])
    assertEquals(finding.predefined_attributes, [
      attribute('Finding site', 'Gastrointestinal tract structure', 'body structure'),
      attribute('Interprets', 'Digestive system function', 'observable entity'),
    ])
  })

  itParallel('Headache surfaces the qualifiers that rules care about, sorted alphabetically', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Headache" "finding"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, HEADACHE_QUALIFIERS)
    assertEquals(finding.predefined_attributes, [
      attribute('Finding site', 'Head structure', 'body structure'),
    ])
  })

  itParallel('relevant qualifiers on a finding are unaffected by the qualifiers already recorded on it', async () => {
    const finding = await insertFindingForTest(`
      (clinical_finding
        (snomed_concept "Headache" "finding")
        (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    `)

    assertEquals(finding.displays.full, 'Sudden onset Headache')
    assertEquals(finding.relevant_qualifiers, HEADACHE_QUALIFIERS)
  })

  itParallel('Migraine, a descendant of Headache, inherits the Headache qualifiers but has its own predefined attributes', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Migraine" "disorder"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, HEADACHE_QUALIFIERS)
    assertEquals(finding.predefined_attributes, [
      attribute('Finding site', 'Vascular structure of head', 'body structure'),
    ])
  })

  itParallel('Pain, an ancestor of Headache, Chest pain and Foot pain, does not gather qualifiers from its descendants', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Pain" "finding"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, [])
    assertEquals(finding.predefined_attributes, [])
  })

  itParallel('Swelling of limb deduplicates the qualifiers it inherits from the many rules on Swelling', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Swelling of limb" "finding"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, SWELLING_QUALIFIERS)
    assertEquals(finding.predefined_attributes, [
      attribute('Associated morphology', 'Swelling', 'morphologic abnormality'),
      attribute('Finding site', 'Limb structure', 'body structure'),
    ])
  })

  itParallel('Swelling itself surfaces the same qualifiers as its descendants', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Swelling" "finding"))',
    )

    assertEquals(finding.relevant_qualifiers, SWELLING_QUALIFIERS)
    assertEquals(finding.predefined_attributes, [
      attribute('Associated morphology', 'Swelling', 'morphologic abnormality'),
    ])
  })

  itParallel('a finding with no rules on it or its ancestors has no relevant qualifiers and no onset requirement', async () => {
    const finding = await insertFindingForTest(
      '(clinical_finding (snomed_concept "Common cold" "disorder"))',
    )

    assertEquals(finding.onset_required, false)
    assertEquals(finding.relevant_qualifiers, [])
    assertEquals(finding.predefined_attributes, [
      attribute('Causative agent', 'Virus', 'organism'),
      attribute('Finding site', 'Upper respiratory tract structure', 'body structure'),
      attribute('Pathological process', 'Infectious process', 'qualifier value'),
    ])
  })
})
