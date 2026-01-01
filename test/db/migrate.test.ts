import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { migrate } from '../../db/migrate.ts'

describeParallel('test database', () => {
  afterAll(() => db.destroy())
  itParallel('is running against the latest migrations', async () => {
    await migrate.check()
  })
})
