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
import { additional_tasks, isCheckFor, isMeasurements } from '../../db/models/additional_tasks.ts'
import { due_to } from '../../db/models/due_to.ts'
import { assertMatches } from '../../util/assertMatches.ts'

import isString from '../../util/isString.ts'
import sortBy from '../../util/sortBy.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'

describeParallel('db/models/additional_tasks.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'all of the findings referenced to in check_for actually exist',
    async () => {
      const findings = TASKS.flatMap(({ to_be_done }): Lang['finding' | 'measurement'][] => {
        if (isCheckFor(to_be_done)) return to_be_done.value
        if (isMeasurements(to_be_done)) return to_be_done.value
        return []
      })

      await pMap(findings, async (finding) => {
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

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [inserted_finding],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)
    assert(!isString(tasks_to_insert))

    assertMatches(sortBy(tasks_to_insert, 'description'), [
      { description: 'Check for urgent bite/sting conditions' },
      { description: 'Display medical guidance for Bites' },
      { description: 'Display medical guidance for Injured patient' },
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

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const inserted_evalution = await patient_evaluations.insertOneNested(
      db,
      {
        patient_id,
        patient_encounter_id,
        by_system: true,
        evaluates_record_id: inserted_finding.id,
        evaluation: `(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)`,
      },
    ).executeTakeFirstOrThrow()
    assert(inserted_evalution.success)

    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [{
        id: inserted_evalution.evaluation_id,
        existence: 'Yes',
      }],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)

    assert(!isString(tasks_to_insert))

    assertMatches(
      sortBy(tasks_to_insert, 'description'),
      [
        {
          description: 'Check for Anaphylaxis',
          due_to: {
            atom: 'diagnosis',
            certainty_qualifier: 'possible',
            snomed_concept: {
              atom: 'snomed_concept',
              name: 'Anaphylaxis',
              category: 'disorder',
            },
          },
          to_be_done: {
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
        {
          description: 'Display medical guidance for Anaphylaxis',
          due_to: {
            atom: 'active_condition',
            snomed_concept: {
              atom: 'snomed_concept',
              name: 'Anaphylaxis',
              category: 'disorder',
            },
            possible: true,
          },
          to_be_done: {
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
      ],
    )
  })

  itParallel('displays the reference doc for joint conditions when Abnormal prominence of acromion is found', async () => {
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
          `(clinical_finding (snomed_concept "Abnormal prominence of acromion" "finding"))`,
        ],
      },
    )

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [inserted_finding],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)

    assert(!isString(tasks_to_insert))
    assertMatches(sortBy(tasks_to_insert, 'description'), [
      { description: 'Check for urgent arm or hand symptom conditions' },
      { description: 'Check for urgent joint conditions' },
      { description: 'Display medical guidance for Arm symptoms' },
      { description: 'Display medical guidance for Joint symptoms' },
    ])
  })

  itParallel('does not trigger a check for face symptoms for an ear symptom (Otalgia)', async () => {
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
          `(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))`,
        ],
      },
    )

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [inserted_finding],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)

    assert(!isString(tasks_to_insert))
    assert(
      tasks_to_insert.every((task) => task.description !== 'Check for urgent face symptom conditions'),
      'Ear symptom (Otalgia) should not trigger a check for urgent face symptom conditions',
    )
  })

  itParallel('does not trigger a check for face symptoms for a nose finding', async () => {
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
          `(clinical_finding (snomed_concept "Nose finding" "finding"))`,
        ],
      },
    )

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [inserted_finding],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)

    assert(!isString(tasks_to_insert))
    assert(
      tasks_to_insert.every((task) => task.description !== 'Check for urgent face symptom conditions'),
      'Nose finding should not trigger a check for urgent face symptom conditions',
    )
  })

  itParallel('displays additional tasks for pain of mouth', async () => {
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
          `(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure")))`,
        ],
      },
    )

    const [inserted_finding] = inserted_findings.findings
    assert(inserted_finding)
    const due_to_result = await due_to.determineFromNewRecords(db, {
      patient_id,
      patient_encounter_id,
      patient_age_determination: 'adult',
      records: [inserted_finding],
    })
    assert(!isString(due_to_result))
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)

    assert(!isString(tasks_to_insert))
    assert(tasks_to_insert.length > 0)
  })
})
