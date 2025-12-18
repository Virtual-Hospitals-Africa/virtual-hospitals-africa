import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import {
  parseExpression,
  parseExpressionExpectingType,
} from '../../shared/s_expression.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
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

describe('db/models/s_expression.ts', () => {
  afterAll(() => db.destroy())

  it("can insert a Burn Circumferential finding which isn't later then considered a Burn Other finding", async () => {
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

    const finding = parseExpression(
      WARNING_SIGNS['Burn Circumferential'].clinical_finding_s_expression,
    )
    assert(finding.type === 'finding')

    const { procedure_id } = await patient_procedures.insertOneNested(db, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
      employment_id: encounter.employee.employee_id,
      procedure: parseExpressionExpectingType(
        `(procedure ${WORKFLOW_SNOMED_CONCEPT_IDS.triage})`,
        'procedure',
      ),
    })

    await patient_findings.insertOneNested(db, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
      patient_encounter_employee_id:
        encounter.employee.patient_encounter_employee_id,
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
        'snomed_concept_id': '404684003',
        'patient_encounter_id': encounter.patient_encounter_id,
        'patient_encounter_employee_id':
          encounter.employee.patient_encounter_employee_id,
        'name': 'Clinical finding',
        'value_snomed_concept_id': null,
        'value_name': null,
        'as_part_of_procedure': {
          'record_id': z.string().uuid(),
          'snomed_concept_id': '225390008',
          'name': 'Triage',
        },
        'qualifiers': [
          {
            'record_id': z.string().uuid(),
            'snomed_concept_id': '125666000',
            'name': 'Burn',
            'value_name': null,
            'qualifiers': [
              {
                'record_id': z.string().uuid(),
                'snomed_concept_id': '255593009',
                'name': 'Circumferential',
                'value_name': null,
                'qualifiers': [],
              },
            ],
          },
        ],
      },
    ])

    const query = buildExpression(
      db,
      { patient_id: encounter.patient.id },
      parseExpression(
        WARNING_SIGNS['Burn Other'].clinical_finding_s_expression,
      ),
    )

    const result = await query.execute()
    assertArrayEmpty(result)
  })
})
