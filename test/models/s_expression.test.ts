import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { parseExpression, parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { findingQueryExpression, KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { buildExpression } from '../../db/models/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { assert } from 'std/assert/assert.ts'
import { WORKFLOW_SNOMED_CONCEPT_IDS } from '../../shared/workflow.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import z from 'zod'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { PROCEDURE } from '../../shared/snomed_concepts.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import assertLength from '../../util/assertLength.ts'

describeParallel('db/models/s_expression.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    "can insert a Burn Circumferential finding which isn't later then considered a Burn Other finding",
    async () => {
      const nurse = await addTestEmployee(db, {
        profession: 'nurse',
        registration_status: 'approved',
      })

      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.organization_id,
        {
          employment_id: nurse.employee_id,
        },
      )

      const finding = parseExpression(
        KEYED_WARNING_SIGNS['Burn Circumferential'].clinical_finding_s_expression,
      )
      assert(finding.atom === 'finding')

      const { procedure_id } = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: encounter.employee.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.id} ${WORKFLOW_SNOMED_CONCEPT_IDS.triage})`,
          'procedure',
        ),
      })

      await patient_findings.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
        procedure_id,
        finding,
      })

      const findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertMatches(findings, [
        {
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '404684003',
            'name': 'Clinical finding',
            'category': 'finding',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '125666000',
            'name': 'Burn',
            'category': 'disorder',
          },
          'value': null,
          'evaluations': [],
          'destination_relations': [],
          'source_relations': [],
          'type': 'finding',
          'patient_encounter_employee_id': z.string().uuid(),
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '225390008',
              'name': 'Triage',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': null,
          'modifiers': [
            {
              'record_id': z.string().uuid(),
              'created_at': z.iso.datetime({ offset: true }),
              'patient_encounter_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '362981000',
                'name': 'Qualifier value',
                'category': 'qualifier value',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '255593009',
                'name': 'Circumferential',
                'category': 'qualifier value',
              },
              'value': null,
              'qualifiers': [],
            },
          ],
          'displays': {
            'value': null,
            'finding': 'Circumferential Burn',
            'full': 'Circumferential Burn',
          },
          'attributes': [],
        },
      ])
      const query = buildExpression(
        db,
        { patient_id: encounter.patient.id },
        parseExpression(
          findingQueryExpression(KEYED_WARNING_SIGNS['Burn Other']),
        ),
      )

      const result = await query.execute()
      assertArrayEmpty(result)
    },
  )

  itParallel(
    'can insert a Nasal discharge finding which then matches for a query for finding site: nasal structure',
    async () => {
      const nurse = await addTestEmployee(db, {
        profession: 'nurse',
        registration_status: 'approved',
      })

      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
        db,
        nurse.organization_id,
        {
          employment_id: nurse.employee_id,
        },
      )

      const { procedure_id } = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: encounter.employee.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.id} ${WORKFLOW_SNOMED_CONCEPT_IDS.triage})`,
          'procedure',
        ),
      })

      await patient_findings.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
        procedure_id,
        finding: `(clinical_finding (snomed_concept "Nasal discharge" "finding"))`,
      })

      const nasal_structure_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
        s_expression: `
          (clinical_finding 
            (attribute (snomed_concept "Finding site" "attribute")
                      (snomed_concept "Nasal structure" "body structure")))
        `,
      })

      assertLength(nasal_structure_findings, 1)
      assertMatches(nasal_structure_findings[0], {
        'record_id': z.string().uuid(),
        'specific_snomed_concept': {
          'name': 'Nasal discharge',
          'category': 'finding',
        },
      })

      const face_structure_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
        s_expression: `
          (clinical_finding 
            (attribute (snomed_concept "Finding site" "attribute")
                      (snomed_concept "Face structure" "body structure")))
        `,
      })

      assertLength(face_structure_findings, 1)

      const stomach_structure_findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
        s_expression: `
          (clinical_finding 
            (attribute (snomed_concept "Finding site" "attribute")
                      (snomed_concept "Stomach structure" "body structure")))
        `,
      })

      assertLength(stomach_structure_findings, 0)

      const nasal_structure_shorthand_findings = await patient_findings.findAll(
        db,
        {
          patient_id: encounter.patient.id,
          s_expression: `
          (clinical_finding 
            (finding_site (snomed_concept "Nasal structure" "body structure")))
        `,
        },
      )

      assertLength(nasal_structure_shorthand_findings, 1)
    },
  )
})
