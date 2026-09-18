import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { TrxOrDb } from '../../types.ts'
import { normalForm } from '../../shared/s_expression.ts'

// Seeded via the system_priority_evaluation "Urgent: constipation lasting over
// 24 hours with abdominal pain"
const CONSTIPATION_ONSET_S_EXPRESSION = `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`

const BITE_WOUND_S_EXPRESSION = normalForm('(clinical_finding (snomed_concept "Bite - wound" "disorder"))')

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

/*
  insertMany tags the records it inserts with the due_tos they satisfy as part of the same
  statement, so the rows are expected to be there as soon as the insert returns.
*/
async function insertFindingAndReadSatisfiedDueTos(
  trx: TrxOrDb,
  finding: string,
) {
  const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(trx)
  const inserted_findings = await patient_findings.insertMany(
    trx,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id: employee.patient_encounter_employee_id,
      employment_id: employee.employee_id,
      patient_age_determination: 'adult',
      procedure: {
        create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
      },
      findings: [finding],
    },
  )

  const [inserted_finding] = inserted_findings.findings
  assert(inserted_finding)

  return trx.selectFrom('patient_record_satisfying_due_tos')
    .innerJoin('due_to', 'due_to.id', 'patient_record_satisfying_due_tos.due_to_id')
    .where('patient_record_satisfying_due_tos.patient_record_id', '=', inserted_finding.id)
    .select('due_to.s_expression')
    .execute()
}

describeParallel('db/models/due_to.ts', () => {
  afterAll(() => db.destroy())

  itParallel('tags an inserted finding with the due_tos it satisfies within the inserting statement', async () => {
    const satisfying = await insertFindingAndReadSatisfiedDueTos(db, BITE_WOUND_S_EXPRESSION)
    assert(
      satisfying.some((row) => row.s_expression === BITE_WOUND_S_EXPRESSION),
      `Bite - wound should satisfy ${BITE_WOUND_S_EXPRESSION}, but only satisfied:\n${satisfying.map((row) => row.s_expression).join('\n')}`,
    )
  })

  itParallel('does not tag a negative finding', async () => {
    const satisfying = await insertFindingAndReadSatisfiedDueTos(db, `(no ${BITE_WOUND_S_EXPRESSION})`)
    assert(satisfying.length === 0, `A negative finding should satisfy no due_to, but satisfied:\n${satisfying.map((row) => row.s_expression).join('\n')}`)
  })

  itParallel('tags a finding whose onset event satisfies an event_time_comparison due_to', async () => {
    const satisfying = await insertFindingAndReadSatisfiedDueTos(
      db,
      `(clinical_finding (snomed_concept "Constipation" "finding") (event (snomed_concept "Time of onset" "observable entity") "${hoursAgo(48)}"))`,
    )
    assert(
      satisfying.some((row) => row.s_expression === CONSTIPATION_ONSET_S_EXPRESSION),
      `Constipation with onset 48 hours ago should satisfy ${CONSTIPATION_ONSET_S_EXPRESSION}, but only satisfied:\n${
        satisfying.map((row) => row.s_expression).join('\n')
      }`,
    )
  })

  itParallel('does not tag a finding whose onset event falls outside the compared range', async () => {
    const satisfying = await insertFindingAndReadSatisfiedDueTos(
      db,
      `(clinical_finding (snomed_concept "Constipation" "finding") (event (snomed_concept "Time of onset" "observable entity") "${hoursAgo(1)}"))`,
    )
    assert(
      satisfying.every((row) => row.s_expression !== CONSTIPATION_ONSET_S_EXPRESSION),
      `Constipation with onset 1 hour ago should not satisfy ${CONSTIPATION_ONSET_S_EXPRESSION}`,
    )
  })

  itParallel('does not tag a finding of an unrelated concept against an event_time_comparison due_to', async () => {
    const satisfying = await insertFindingAndReadSatisfiedDueTos(
      db,
      `(clinical_finding (snomed_concept "Common cold" "disorder") (event (snomed_concept "Time of onset" "observable entity") "${hoursAgo(48)}"))`,
    )
    assert(
      satisfying.every((row) => row.s_expression !== CONSTIPATION_ONSET_S_EXPRESSION),
      `Common cold should not satisfy ${CONSTIPATION_ONSET_S_EXPRESSION}`,
    )
  })
})
