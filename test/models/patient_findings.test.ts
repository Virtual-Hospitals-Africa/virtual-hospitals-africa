import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { satisfyingSExpression } from '../../db/models/s_expression.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { patient_record_providers } from '../../db/models/patient_record_providers.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { CLINICAL_FINDING, PROCEDURE } from '../../shared/snomed_concepts.ts'
import assertLength from '../../util/assertLength.ts'
import { asNormalFormSExpression } from '../../shared/patient_records.ts'

describeParallel('db/models/patient_findings.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'can insert/find records with snomed_concept attributes',
    async () => {
      const nurse = await addTestEmployee(db, {
        role: 'nurse',
      })

      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.organization_id,
        {
          employment_id: nurse.employee_id,
        },
      )
      const patient_id = encounter.patient.id

      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression}
          ${WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals.s_expression})`,
          'procedure',
        ),
      })

      const burn_of_left_arm_by_attribute_s_expression = `
      (clinical_finding
        (snomed_concept "Burn" "disorder")
        (attribute (snomed_concept "Finding site" "attribute")
                   (snomed_concept "Left upper arm structure" "body structure")))
    `

      const { finding_id, inserted_new } = await patient_findings
        .insertOneNested(
          db,
          {
            patient_id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            procedure_id: procedure.procedure_id,
            finding: burn_of_left_arm_by_attribute_s_expression,
          },
        )

      assert(inserted_new)

      const [finding] = await patient_findings.getById(db, finding_id)
        .then((f) =>
          patient_record_providers.hydrateIntermediateRecords(db, {
            records: [f],
            health_worker_id: nurse.id,
            encounter,
          })
        )

      assertEquals(
        finding.displays.full,
        'Burn (Left upper arm structure)',
      )

      assertMatches(finding.attributes, [
        {
          'id': z.string().uuid(),
          'created_at': z.iso.datetime({ offset: true }),
          'patient_encounter_id': z.string().uuid(),
          'root_snomed_concept_id': '246061005',
          'root_snomed_concept_name': 'Attribute',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '363698007',
          'specific_snomed_concept_name': 'Finding site',
          'specific_snomed_concept_category': 'attribute',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '368208006',
            'name': 'Left upper arm structure',
            'category': 'body structure',
          },
          'displays': {
            'finding': 'Finding site',
            'value': 'Left upper arm structure',
            'full': 'Finding site: Left upper arm structure',
          },
        },
      ], { strict: true })

      const records = await satisfyingSExpression(
        db,
        {
          patient_id,
          s_expression: burn_of_left_arm_by_attribute_s_expression,
        },
      )

      assertEquals(records, {
        satisfies: true,
        record_ids: [finding_id],
      })

      const records_slightly_off = await satisfyingSExpression(
        db,
        {
          patient_id,
          // Right arm != Left arm
          s_expression: `
          (clinical_finding 
            (snomed_concept "Burn" "disorder")
            (attribute (snomed_concept "Finding site" "attribute") 
                        (snomed_concept "Right upper arm structure" "body structure")))
        `,
        },
      )

      assertEquals(records_slightly_off, {
        satisfies: false,
        record_ids: [],
      })
    },
  )

  itParallel('can insert/find records with an event attribute', async () => {
    const nurse = await addTestEmployee(db, {
      role: 'nurse',
    })

    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
      db,
      nurse.organization_id,
      {
        employment_id: nurse.employee_id,
      },
    )
    const patient_id = encounter.patient.id

    const procedure = await patient_procedures.insertOneNested(db, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
      employment_id: nurse.employee_id,
      procedure: parseExpressionExpectingAtom(
        `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals.s_expression})`,
        'procedure',
      ),
    })

    // 263501003 |Time of onset (observable entity)|
    const common_cold_attribute_s_expression = `
      (clinical_finding
        (snomed_concept "Common cold" "disorder")
        (event (snomed_concept "Time of onset" "observable entity")
                   "2025-12-28 19:51:18.275362-05"))
    `

    const { finding_id, inserted_new } = await patient_findings
      .insertOneNested(
        db,
        {
          patient_id,
          patient_encounter_id: encounter.patient_encounter_id,
          patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
          procedure_id: procedure.procedure_id,
          finding: common_cold_attribute_s_expression,
        },
      )

    assert(inserted_new)

    const raw_finding = await patient_findings.getById(db, finding_id)

    const [finding] = await patient_record_providers.hydrateIntermediateRecords(
      db,
      {
        records: [raw_finding],
        health_worker_id: nurse.id,
        encounter,
      },
    )

    assertEquals(
      finding.displays.full,
      'Common cold',
    )

    assertLength(finding.attributes, 1)
    assertMatches(finding.attributes[0], {
      'id': z.string().uuid(),
      'root_snomed_concept_id': '272379006',
      'root_snomed_concept_category': 'event',
      'root_snomed_concept_name': 'Event',
      'displays': {
        'finding': 'Time of onset',
        'value': '2:51:18 am SAST | Monday, December 29, 2025', // The display is converted from EST (-05) to SAST (+02)
        'full': 'Time of onset: 2:51:18 am SAST | Monday, December 29, 2025',
      },
      'created_at': z.iso.datetime({ offset: true }),
      'patient_encounter_id': z.string().uuid(),
      'specific_snomed_concept_id': '263501003',
      'specific_snomed_concept_name': 'Time of onset',
      'specific_snomed_concept_category': 'observable entity',
      'value': {
        'type': 'event',
        'datetime': '2025-12-29T00:51:18.275362+00:00', // The database is in UTC
      },
    }, { strict: true })
  })

  itParallel(
    'can insert/find a finding with a complex display involving nested qualifiers',
    async () => {
      const nurse = await addTestEmployee(db, {
        role: 'nurse',
      })

      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.organization_id,
        {
          employment_id: nurse.employee_id,
        },
      )
      const patient_id = encounter.patient.id

      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals.s_expression})`,
          'procedure',
        ),
      })

      // Normal For Age Ability to move
      const normal_for_age_s_expression = `
        (finding
          ${CLINICAL_FINDING.s_expression}
          (snomed_concept "Ability to move" "observable entity")
          (snomed_concept "Normal" "qualifier value")
          (qualifier (snomed_concept "For" "qualifier value")
            (qualifier (snomed_concept "Age" "qualifier value"))))
      `

      const { finding_id, inserted_new } = await patient_findings
        .insertOneNested(
          db,
          {
            patient_id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            procedure_id: procedure.procedure_id,
            finding: normal_for_age_s_expression,
          },
        )

      assert(inserted_new)

      const raw_finding = await patient_findings.getById(db, finding_id)
      assertEquals(raw_finding.displays.full, 'Ability to move For Age: Normal')

      assertEquals(
        asNormalFormSExpression(raw_finding),
        '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Ability to move" "observable entity") (snomed_concept "Normal" "qualifier value") (qualifier (snomed_concept "For" "qualifier value")))',
      )
    },
  )
})
