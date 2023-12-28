import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as family from '../../db/models/family.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const guardianRelationships = await family.getAllGuardianRelationships(ctx.state.trx)
    return json(guardianRelationships)
  },
}
