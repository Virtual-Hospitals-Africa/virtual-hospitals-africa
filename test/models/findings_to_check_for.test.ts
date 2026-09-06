import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import z from 'zod'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { findings_to_check_for } from '../../db/models/findings_to_check_for.ts'
import { due_to } from '../../db/models/due_to.ts'
import { rules } from '../../db/models/rules.ts'
import { additional_tasks, isCheckFor } from '../../db/models/additional_tasks.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { normalForm, parseWithSchema } from '../../shared/s_expression.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { COMMON_SYMPTOMS } from '../../shared/common_symptoms.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import isString from '../../util/isString.ts'
import sortBy from '../../util/sortBy.ts'
import uniq from '../../util/uniq.ts'
import { pMap } from '../../util/inParallel.ts'
import matching from '../../util/matching.ts'

const URGENT_BITE_STING_CHECK_FORS = [
  '(clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))',
  '(clinical_finding (snomed_concept "Has drooping eyelids" "finding"))',
  '(clinical_finding (snomed_concept "Difficulty swallowing" "finding"))',
  '(clinical_finding (snomed_concept "Difficulty talking" "finding"))',
  '(clinical_finding (snomed_concept "Diplopia" "disorder"))',
  '(clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))',
  '(clinical_finding (snomed_concept "Avulsion - injury" "disorder"))',
  '(clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))',
  '(clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))',
  '(clinical_finding (snomed_concept "Infection of bite wound" "disorder"))',
  '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))',
  '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))',
].map(normalForm)

const SNAKE_BITE_CHECK_FORS = [
  '(clinical_finding (snomed_concept "Snake bite - wound" "disorder"))',
  '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))',
].map(normalForm)

const NOSE_CHECK_FORS = [
  '(clinical_finding (snomed_concept "Injury of head" "disorder"))',
  '(clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))',
  '(clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))',
].map(normalForm)

function asFinding(s_expression: string) {
  return parseWithSchema(s_expression, insertable_finding_base)
}

async function dryRun(
  { patient_id, patient_encounter_id }: { patient_id: string; patient_encounter_id: string },
  s_expression: string,
) {
  const result = await findings_to_check_for.forHypotheticalFinding(db, {
    patient_id,
    patient_encounter_id,
    patient_age_determination: 'adult',
    finding: asFinding(s_expression),
  })
  return sortBy(result, 's_expression')
}

async function insertFindingsAndTagDueTos(
  encounter: Awaited<ReturnType<typeof insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest>>,
  findings: string[],
) {
  const { employee, patient_id, patient_encounter_id } = encounter
  const inserted = await patient_findings.insertMany(db, {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id: employee.patient_encounter_employee_id,
    employment_id: employee.employee_id,
    procedure: {
      create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
    },
    findings,
  })
  const due_to_result = await due_to.determineFromNewRecords(db, {
    patient_id,
    patient_encounter_id,
    patient_age_determination: 'adult',
    records: inserted.findings,
  })
  return { inserted, due_to_result }
}

describeParallel('db/models/findings_to_check_for.ts', () => {
  afterAll(() => db.destroy())

  itParallel('lists the check_for findings a matching task would prompt for, without inserting anything', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

    const result = await dryRun(encounter, '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))')

    assertEquals(
      result.map((r) => r.s_expression),
      URGENT_BITE_STING_CHECK_FORS.toSorted(),
    )
    assert(result.every((r) => r.existing_record === null))

    const records = await patient_findings.findAll(db, {
      patient_id: encounter.patient_id,
      patient_encounter_id: encounter.patient_encounter_id,
      include_negative: true,
    })
    assertEquals(records, [], 'Dry run must not insert any records')
  })

  itParallel('honors an (excluding ...) clause on the due_to', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

    // An insect bite is an animal bite, so the snake bite task is excluded
    const insect_bite = await dryRun(encounter, '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))')
    for (const s_expression of SNAKE_BITE_CHECK_FORS) {
      assert(!insect_bite.some(matching({ s_expression })), `Did not expect ${s_expression}`)
    }

    // A generic bite wound is not an animal bite, so both bite tasks apply
    const bite = await dryRun(encounter, '(clinical_finding (snomed_concept "Bite - wound" "disorder"))')
    assertEquals(
      bite.map((r) => r.s_expression),
      [...URGENT_BITE_STING_CHECK_FORS, ...SNAKE_BITE_CHECK_FORS].toSorted(),
    )
  })

  itParallel('matches a finding_site due_to via an explicit finding_site attribute', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

    const without_site = await dryRun(encounter, '(clinical_finding (snomed_concept "Swelling" "finding"))')
    for (const s_expression of NOSE_CHECK_FORS) {
      assert(!without_site.some(matching({ s_expression })), `Did not expect ${s_expression}`)
    }

    const with_site = await dryRun(
      encounter,
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))',
    )
    for (const s_expression of NOSE_CHECK_FORS) {
      assert(with_site.some(matching({ s_expression })), `Expected ${s_expression}`)
    }
  })

  itParallel('matches a finding_site due_to inferred from the SNOMED definition of the concept', async () => {
    // SNOMED defines Stenosis of nostril as having Finding site = a nasal structure, so it
    // satisfies the nasal finding_site due_to without any finding_site attribute being recorded
    const matched_due_tos = await due_to.forHypotheticalFinding(db, {
      patient_age_determination: 'adult',
      finding: asFinding('(clinical_finding (snomed_concept "Stenosis of nostril" "disorder"))'),
    })

    const s_expression = normalForm('(clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure")))')
    assert(matched_due_tos.some(matching({ s_expression })), `Expected ${s_expression} among ${JSON.stringify(matched_due_tos)}`)

    const result = await dryRun(
      await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db),
      '(clinical_finding (snomed_concept "Stenosis of nostril" "disorder"))',
    )
    for (const s_expression of NOSE_CHECK_FORS) {
      assert(result.some(matching({ s_expression })), `Expected ${s_expression}`)
    }
  })

  itParallel('reports an existing record for check_for findings already recorded in this encounter', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
    await insertFindingsAndTagDueTos(encounter, [
      '(no (clinical_finding (snomed_concept "Difficulty swallowing" "finding")))',
      '(clinical_finding (snomed_concept "Diplopia" "disorder"))',
    ])

    const result = await dryRun(encounter, '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))')

    assertMatches(
      result.filter((r) => r.existing_record),
      [
        {
          s_expression: normalForm('(clinical_finding (snomed_concept "Difficulty swallowing" "finding"))'),
          existing_record: {
            s_expression: inverseSExpression(asFinding('(no (clinical_finding (snomed_concept "Difficulty swallowing" "finding")))')),
            existence: 'No',
          },
        },
        {
          s_expression: normalForm('(clinical_finding (snomed_concept "Diplopia" "disorder"))'),
          existing_record: {
            s_expression: normalForm('(clinical_finding (snomed_concept "Diplopia" "disorder"))'),
            existence: 'Yes',
          },
        },
      ],
    )
  })

  itParallel('returns nothing for a negative finding', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
    const result = await dryRun(encounter, '(no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))')
    assertEquals(result, [])
  })

  itParallel('returns nothing for a finding no task is due to', async () => {
    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
    const result = await dryRun(encounter, '(clinical_finding (snomed_concept "Hangnail" "disorder"))')
    assertEquals(result, [])
  })

  describeParallel('rules.getApplicableForHypotheticalRecord', () => {
    itParallel('combines the hypothetical record with evidence already recorded for the patient', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const { patient_id, patient_encounter_id } = encounter
      const finding = asFinding('(clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))')

      async function applicableDescriptions() {
        const matched_due_tos = await due_to.forHypotheticalFinding(db, { patient_age_determination: 'adult', finding })
        const applicable = await rules.getApplicableForHypotheticalRecord(db, {
          patient_id,
          patient_encounter_id,
          patient_age_determination: 'adult',
          matched_due_tos,
          type: 'system_priority_evaluation',
        })
        return applicable.map((rule) => rule.description)
      }

      // (and (Bite - wound) (or ... Generalized muscle weakness ...)) needs a bite on record
      assert(!(await applicableDescriptions()).includes('Urgent: bite with danger signs'))

      await insertFindingsAndTagDueTos(encounter, ['(clinical_finding (snomed_concept "Bite - wound" "disorder"))'])

      assert((await applicableDescriptions()).includes('Urgent: bite with danger signs'))
    })
  })

  describeParallel('parity with the real pipeline', () => {
    const s_expressions = uniq([
      ...WARNING_SIGNS.adult.map((sign) => sign.clinical_finding_s_expression),
      ...COMMON_SYMPTOMS.map((symptom) => symptom.clinical_finding_s_expression),
    ])

    itParallel('produces the same check_for findings as actually inserting the finding', async () => {
      const mismatches = await pMap(s_expressions, async (s_expression) => {
        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

        const dry_run = await dryRun(encounter, s_expression)

        const { due_to_result } = await insertFindingsAndTagDueTos(encounter, [s_expression])
        const tasks_to_insert = isString(due_to_result) ? [] : await additional_tasks.getTasksToInsertUsingPreComputedTables(db, due_to_result)
        assert(!isString(tasks_to_insert))

        const actual = uniq(tasks_to_insert.flatMap((task) => isCheckFor(task.to_be_done) ? task.to_be_done.value.map((f) => inverseSExpression(f)) : []))
          .toSorted()

        const expected = dry_run.map((r) => r.s_expression)
        if (JSON.stringify(actual) === JSON.stringify(expected)) return null
        return { s_expression, dry_run: expected, actual }
      }, { concurrency: 4 })

      assertEquals(mismatches.filter(Boolean), [])
    })

    itParallel('exercises at least one warning sign with a qualifier', () => {
      assertMatches(s_expressions.filter((s) => s.includes('(qualifier')), z.array(z.string()).min(1))
    })
  })
})
