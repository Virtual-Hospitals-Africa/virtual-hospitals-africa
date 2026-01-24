import { Context } from 'fresh'
import db from '../db/db.ts'
import { addTestEmployee } from '../mocks/testEmployee.ts'
import { employees } from '../db/models/employees.ts'
import { TriageTutorial } from '../islands/TriageTutorial.tsx'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { getWarningSignsForPatient } from './app/organizations/[organization_id]/patients/[patient_id]/open_encounter/triage/warning_signs.tsx'

export default async function TutorialPage(
  ctx: Context<unknown>,
) {
  const employee = await addTestEmployee(db)
  console.log({ employee })
  // return <p>OK</p>
  console.log('kewlewlk')
  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    employee.organization_id,
    {
      patient_demographics: {},
      employment_id: employee.employee_id,
      is_tutorial: true,
    },
  )
  console.log('kewlewlk')
  const foo = await employees.getById(db, employee.employee_id)

  console.log('kewlewlk')
  const warning_signs = await getWarningSignsForPatient(db, encounter.patient.id)

  return (
    <TriageTutorial
      url={ctx.url}
      employee={foo}
      route={ctx.route!}
      patient={encounter.patient}
      warning_signs={warning_signs}
    />
  )
}
