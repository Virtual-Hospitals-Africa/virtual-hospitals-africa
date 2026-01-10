import { asNames, NameInputs } from '../../db/models/asNames.ts'
import {
  health_worker_google_tokens,
  type HealthWorkerWithGoogleTokens,
} from '../../db/models/health_worker_google_tokens.ts'
import randomAvatarMediaId from '../../mocks/randomAvatar.ts'
import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

export function testHealthWorker() {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  const surname = generateUUID()
  return {
    name: `Test Health Worker ${surname}`,
    surname,
    first_names: 'Test Health Worker',
    preferred_name: 'Test',
    email: generateUUID() + '@example.com',
    avatar_media_id: randomAvatarMediaId(),
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}

export function insertHealthWorker(
  trx: TrxOrDb,
  opts: Partial<HealthWorkerWithGoogleTokens> & NameInputs,
) {
  const defaults = testHealthWorker()
  const to_insert = {
    ...defaults,
    ...opts,
    ...asNames(opts),
  }
  return health_worker_google_tokens.insertWithGoogleCredentials(trx, to_insert)
}
