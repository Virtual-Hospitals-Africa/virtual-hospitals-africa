import db from '../db/db.ts'
import { addTestEmployee } from '../mocks/testEmployee.ts'

if (import.meta.main) {
  await addTestEmployee(db)
  await addTestEmployee(db)
  await addTestEmployee(db)
}
