import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import omit from '../../util/omit.ts'

const omitTokens = omit(['access_token', 'refresh_token', 'expires_at'])

describe('db/models/health_workers.ts', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  it('can upsertWithGoogleCredentials even if a previous health worker without tokens was inserted', async () => {
    await health_workers.upsert(db, {
      name: 'Previous Worker',
      email: 'previous@worker.com',
      avatar_url: 'avatar_url',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
    })

    const result = await health_workers.upsertWithGoogleCredentials(db, {
      name: 'Test Worker',
      email: 'test@worker.com',
      avatar_url: 'avatar_url',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expires_at: new Date(),
    })

    assert(result)
    assertEquals(
      omitTokens(result),
      await health_workers.getByEmail(db, 'test@worker.com'),
    )
    assertEquals(result.access_token, 'test_access_token')
    assertEquals(result.refresh_token, 'test_refresh_token')
  })
})
