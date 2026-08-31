import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { findingQueryExpression, KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { buildExpression } from '../../db/models/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { WORKFLOW_SNOMED_CONCEPTS, WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import z from 'zod'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { PROCEDURE } from '../../shared/snomed_concepts.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import assertLength from '../../util/assertLength.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { check_for } from '../../db/models/check_for.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'

describeParallel('db/models/s_expression.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    "can insert a Burn Circumferential finding which isn't later then considered a Burn Other finding",
    async () => {
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

      const { procedure_id } = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: encounter.employee.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_SNOMED_CONCEPTS.triage.s_expression})`,
          'procedure',
        ),
      })

      await patient_findings.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
        procedure_id,
        finding: KEYED_WARNING_SIGNS['Burn Circumferential'].clinical_finding_s_expression,
      })

      const findings = await patient_findings.findAll(db, {
        patient_id: encounter.patient.id,
      })

      assertMatches(findings, [
        {
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': z.string().uuid(),
          'root_snomed_concept_id': '404684003',
          'root_snomed_concept_name': 'Clinical finding',
          'root_snomed_concept_category': 'finding',
          'specific_snomed_concept_id': '125666000',
          'specific_snomed_concept_name': 'Burn',
          'specific_snomed_concept_category': 'disorder',
          'value': null,
          'evaluations': [],
          'destination_relations': [],
          // 'source_relations': [],
          'type': 'finding',
          'patient_encounter_employee_id': z.string().uuid(),
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '225390008',
            'specific_snomed_concept_name': 'Triage',
            'specific_snomed_concept_category': 'procedure',
          },
          'priority': null,
          'score': null,
          'modifiers': [
            {
              'id': z.string().uuid(),
              'created_at': z.iso.datetime({ offset: true }),
              'patient_encounter_id': z.string().uuid(),
              'root_snomed_concept_id': '362981000',
              'root_snomed_concept_name': 'Qualifier value',
              'root_snomed_concept_category': 'qualifier value',
              'specific_snomed_concept_id': '255593009',
              'specific_snomed_concept_name': 'Circumferential',
              'specific_snomed_concept_category': 'qualifier value',
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
        findingQueryExpression(KEYED_WARNING_SIGNS['Burn Other']),
      )

      const result = await query.execute()
      assertArrayEmpty(result)
    },
  )

  itParallel(
    'can insert a Nasal discharge finding which then matches for a query for finding site: nasal structure',
    async () => {
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

      const { procedure_id } = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: encounter.employee.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${PROCEDURE.s_expression} ${WORKFLOW_SNOMED_CONCEPTS.triage.s_expression})`,
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
        'id': z.string().uuid(),
        'specific_snomed_concept_name': 'Nasal discharge',
        'specific_snomed_concept_category': 'finding',
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

  itParallel('respects (excluding)', async () => {
    const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
    const inserted_findings = await patient_findings.insertMany(
      db,
      {
        patient_id,
        patient_encounter_id,
        patient_encounter_employee_id: employee.patient_encounter_employee_id,
        employment_id: employee.employee_id,
        procedure: {
          create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
        },
        findings: [
          `(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`,
        ],
      },
    )

    const bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(clinical_finding (snomed_concept "Bite - wound" "disorder"))`,
    ).execute()

    assertEquals(bite_result, [{ id: inserted_findings.findings[0]?.id }])

    const excluding_animal_bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(clinical_finding (snomed_concept "Bite - wound" "disorder") (excluding (clinical_finding (snomed_concept "Animal bite wound" "disorder"))))`,
    ).execute()

    assertEquals(excluding_animal_bite_result, [])
  })

  itParallel('respects (no)', async () => {
    const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
    const inserted_findings = await patient_findings.insertMany(
      db,
      {
        patient_id,
        patient_encounter_id,
        patient_encounter_employee_id: employee.patient_encounter_employee_id,
        employment_id: employee.employee_id,
        procedure: {
          create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
        },
        findings: check_for.asInsertableFindings(
          check_for.Schema.array().parse([{
            s_expression: `(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`,
            existence: 'No',
          }]),
        ),
      },
    )

    const positive_general_bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(clinical_finding (snomed_concept "Bite - wound" "disorder"))`,
    ).execute()

    assertEquals(positive_general_bite_result, [])

    const negative_general_bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(no (clinical_finding (snomed_concept "Bite - wound" "disorder")))`,
    ).execute()

    assertEquals(negative_general_bite_result, [])

    const positive_insect_bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`,
    ).execute()

    assertEquals(positive_insect_bite_result, [])

    const negative_insect_bite_result = await buildExpression(
      db,
      { patient_id, patient_encounter_id },
      `(no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))`,
    ).execute()

    assertEquals(negative_insect_bite_result, [{ id: inserted_findings.findings[0]?.id }])
  })
})
