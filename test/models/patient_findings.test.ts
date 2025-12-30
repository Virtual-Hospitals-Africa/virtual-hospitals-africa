import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import {
  parseExpression,
  parseExpressionExpectingAtom,
} from '../../shared/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import {
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  IntermediateFinding,
  patient_findings,
} from '../../db/models/patient_findings.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPT_IDS } from '../../shared/workflow.ts'
import {
  buildExpression,
  satisfyingSExpression,
} from '../../db/models/s_expression.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { hydrateIntermediateRecords } from '../../db/models/patient_record_providers.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { debugLog } from '../../db/helpers.ts'

describe('db/models/patient_findings.ts', () => {
  afterAll(() => db.destroy())

  describe('attributes', () => {
    it('can insert a measurement by equality and then find that measurement using comparator s expressions', async () => {
      const nurse = await addTestEmployee(db, {
        profession: 'nurse',
        registration_status: 'approved',
      })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
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
          `(procedure ${
            WORKFLOW_STEP_SNOMED_CONCEPT_IDS.triage!.measure_vitals
          })`,
          'procedure',
        ),
      })

      const burn_of_left_arm_by_attribute_s_expression = `
        (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID}
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site" "attribute")
                     (snomed_concept "Left upper arm structure" "body structure")))
      `

      patient_findings.verbose = true
      const { finding_id, inserted_new } = await patient_findings
        .insertOneNested(
          db,
          {
            patient_id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id:
              encounter.employee.patient_encounter_employee_id,
            procedure_id: procedure.procedure_id,
            finding: burn_of_left_arm_by_attribute_s_expression,
          },
        )

      console.log({ finding_id })
      assert(inserted_new)

      const [finding] = await patient_findings.getById(db, finding_id)
        .then((f) =>
          hydrateIntermediateRecords(db, {
            records: [f],
            health_worker_id: nurse.id,
            encounter,
          })
        )

      assertEquals(
        finding.full_display,
        'Burn Clinical finding',
      )

      assertMatches(finding.attributes, [
        {
          'record_id': z.string().uuid(),
          'category': 'attribute',
          'snomed_concept_id': '246061005',
          'name': 'Attribute',
          'value_snomed_concept_id': '368208006',
          'value_name': 'Left upper arm structure',
          'value_category': 'body structure',
          'finding_display': 'Finding site',
          'value_display': 'Left upper arm structure',
          'full_display': 'Finding site: Left upper arm structure',
          'finding_snomed_concept_id': '363698007',
          'finding_name': 'Finding site',
          'finding_category': 'attribute',
          'patient_encounter_employee_id': z.string().uuid(),
          'procedure_id': z.string().uuid(),
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

      console.log(parseExpression(`
            (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
              (snomed_concept "Burn" "disorder")
              (attribute (snomed_concept "Finding site" "attribute") 
                         (snomed_concept "Right upper arm structure" "body structure")))
          `))
      debugLog(
        buildExpression(
          db,
          { patient_id },
          `
            (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
              (snomed_concept "Burn" "disorder")
              (attribute (snomed_concept "Finding site" "attribute") 
                         (snomed_concept "Right upper arm structure" "body structure")))
          `,
        ),
      )

      const records_slightly_off = await satisfyingSExpression(
        db,
        {
          patient_id,
          // Right arm != Left arm
          s_expression: `
            (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
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
    })
  })
})
