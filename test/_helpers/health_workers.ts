import { HealthWorkerWithGoogleTokens, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import * as health_workers from '../../db/models/health_workers.ts'

export function testHealthWorker() {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  return {
    name: `Test Health Worker ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}

export function insertHealthWorker(
  trx: TrxOrDb,
  opts?: Partial<HealthWorkerWithGoogleTokens>,
) {
  return health_workers.upsertWithGoogleCredentials(trx, {
    ...testHealthWorker(),
    ...opts,
  })
}
