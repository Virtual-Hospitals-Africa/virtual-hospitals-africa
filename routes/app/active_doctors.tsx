import { health_worker_with_licences } from '../../db/models/health_worker_with_licences.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(health_worker_with_licences, {
  status: 'active',
  doctor: true,
})
