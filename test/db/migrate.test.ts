import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { migrate } from '../../db/migrate.ts'

describe('test database', () => {
  afterAll(() => db.destroy())
  it('is running against the latest migrations', async () => {
    await migrate.check()
  })
})
