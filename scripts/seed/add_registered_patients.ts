import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import db from '../../db/db.ts'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { forEach } from '../../util/inParallel.ts'
import range from '../../util/range.ts'
import { employees } from '../../db/models/employees.ts'
import { addTestEmployee } from '../../mocks/testEmployee.ts'

async function addPatients(count: number) {
  const receptionist = await findOrCreateReceptionist()
  await forEach(range(count), () => {
    return insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db, TEST_ORGANIZATION_UUIDS.ZA.clinic, {
      employment_id: receptionist.employee_id,
      is_tutorial: true,
    })
  })
}

async function findOrCreateReceptionist() {
  const receptionist = await employees.findOneOptional(db, {
    organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    roles: ['receptionist'],
  })
  if (receptionist) return receptionist

  return addTestEmployee(db, {
    role: 'receptionist',
  })
}

if (import.meta.main) {
  const number_of_patients = parseInt(Deno.args[0])
  if (!number_of_patients) {
    console.error(
      'Usage: deno task script scripts/seed/add_registered_patients.ts <number_of_patients>',
    )
    Deno.exit(1)
  }
  await addPatients(number_of_patients)
}
