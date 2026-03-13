import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { snomed_concept_id } from '../../util/validators.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { patient_evaluations } from '../../db/models/patient_evaluations.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { additional_tasks } from '../../db/models/additional_tasks.ts'
import { assertMatches } from '../../util/assertMatches.ts'

describeParallel('db/models/additional_tasks.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'all of the findings referenced to check_for actually exist',
    async () => {
      await pMap(TASKS, async (task) => {
        if (!Array.isArray(task.procedure.value)) return

        for (const finding of task.procedure.value) {
          const snomed_concept = finding.atom === 'measurement' ? finding.snomed_concept : finding.specific_snomed_concept

          assert(snomed_concept)

          const { id } = await nameAndCategorySnomedConceptBase(
            db,
            snomed_concept,
          )
            .executeTakeFirstOrThrow()
            .catch((err) => {
              err.message = inverseSExpression(finding) + ' does not exist. ' +
                err.message
              throw err
            })
          snomed_concept_id.parse(id)
        }
      })
    },
  )

  itParallel('adds reference docs and check_for tasks for an Insect bite - wound', async () => {
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

    assert(inserted_findings.finding_ids[0])
    const tasks_to_insert = await additional_tasks.getTasksToInsert(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [{
        id: inserted_findings.finding_ids[0],
        existence: 'Yes',
      }],
    })
    assertMatches(tasks_to_insert, [
      {
        atom: 'task',
        description: 'Display medical guidance for Bites',
      },
      {
        atom: 'task',
        description: 'Check for urgent bite/sting conditions',
      },
    ])
  })

  itParallel('adds a reference doc task to check for conditions realted to anaphylaxis due to a possible diagnosis of anaphylaxis', async () => {
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

    assert(inserted_findings.finding_ids[0])
    const inserted_evalution = await patient_evaluations.insertOneNested(
      db,
      {
        patient_id,
        patient_encounter_id,
        by_system: true,
        evaluates_record_id: inserted_findings.finding_ids[0],
        evaluation: `(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)`,
      },
    ).executeTakeFirstOrThrow()
    assert(inserted_evalution.success)

    const tasks_to_insert = await additional_tasks.getTasksToInsert(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [{
        id: inserted_evalution.evaluation_id,
        existence: 'Yes',
      }],
    })
    console.log({ tasks_to_insert })
    assertMatches(tasks_to_insert, [
      {
        atom: 'task',
        description: 'Display medical guidance for Anaphylaxis',
        ages: ['adult'],
        due_to: {
          atom: 'active_condition',
          snomed_concept: {
            atom: 'snomed_concept',
            name: 'Anaphylaxis',
            category: 'disorder',
          },
          possible: true,
        },
        procedure: {
          atom: 'procedure',
          root_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Procedure',
            category: 'procedure',
          },
          specific_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Reference documentation',
            category: 'qualifier value',
          },
          qualifiers: [],
          attributes: [],
          value: {
            atom: 'link',
            title: 'APC 2023 — Anaphylaxis',
            href: '/medical-resources/primary-care/adult.pdf#page=20',
            thumbnail_href: '/medical-resources/za/primary-care/adult/thumbnails/400/20.png',
          },
        },
        procedure_id: null,
      },
      {
        atom: 'task',
        description: 'Check for Anaphylaxis',
        ages: ['adult'],
        due_to: {
          atom: 'diagnosis',
          certainty_qualifier: 'possible',
          snomed_concept: {
            atom: 'snomed_concept',
            name: 'Anaphylaxis',
            category: 'disorder',
          },
        },
        procedure: {
          atom: 'procedure',
          root_snomed_concept: {
            atom: 'snomed_concept',
            id: '71388002',
            name: 'Procedure',
            category: 'procedure',
            snomed_concept_id: '71388002',
            s_expression: '(snomed_concept "Procedure" "procedure")',
          },
          specific_snomed_concept: {
            atom: 'snomed_concept',
            id: '409060008',
            name: 'Evaluation for signs and symptoms of physical health problems',
            category: 'procedure',
            snomed_concept_id: '409060008',
            s_expression: '(snomed_concept "Evaluation for signs and symptoms of physical health problems" "procedure")',
          },
          qualifiers: [],
          attributes: [],
        },
        procedure_id: null,
      },
    ])
  })
})
