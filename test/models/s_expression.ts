import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import generateUUID from '../../util/uuid.ts'
import db from '../../db/db.ts'
import { parseExpression } from '../../shared/s_expression.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { buildExpression } from '../../db/models/s_expression.ts'
import { debugLog } from '../../db/helpers.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { warning_signs } from '../../db/models/warning_signs.ts'
import { assert } from 'std/assert/assert.ts'
import { WORKFLOW_SNOMED_CONCEPT_IDS } from '../../shared/workflow.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import z from 'zod'
import { assertArrayEmpty } from '../../util/arraySize.ts'

describe('db/models/s_expression.ts', () => {
  afterAll(() => db.destroy())

  it.skip('creates a query for burns', () => {
    const patient_id = generateUUID()
    const x = buildExpression(
      db,
      patient_id,
      parseExpression(
        WARNING_SIGNS['Burn Other'].clinical_finding_s_expression,
      ),
    )
    debugLog(x)
  })

  it('can insert a burn finding', async () => {
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

    await warning_signs.insertOne(db, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
      patient_encounter_employee_id:
        encounter.employee.patient_encounter_employee_id,
      workflow_snomed_concept_id: WORKFLOW_SNOMED_CONCEPT_IDS.triage,
      workflow_step_snomed_concept_id: null,
      previously_completed_procedures: {
        workflow_record_id: null,
        workflow_step_record_id: null,
      },
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
            'attribute_value': null,
            'qualifiers': [
              {
                'record_id': z.string().uuid(),
                'snomed_concept_id': '255593009',
                'name': 'Circumferential',
                'attribute_value': null,
                'qualifiers': [],
              },
            ],
          },
        ],
      },
    ])

    const x = buildExpression(
      db,
      encounter.patient.id,
      parseExpression(
        WARNING_SIGNS['Burn Other'].clinical_finding_s_expression,
      ),
    )

    debugLog(x)

    const result = await x.execute()
    assertArrayEmpty(result)
  })
})
