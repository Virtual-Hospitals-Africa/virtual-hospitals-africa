import db from '../../db/db.ts'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { addTestEmployee } from '../../mocks/testEmployee.ts'

if (import.meta.main) {
  await addTestEmployee(db, { organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic })
  await addTestEmployee(db, { organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic })
  await addTestEmployee(db, { organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic })
}
