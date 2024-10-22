import * as conditions from '../../db/models/conditions.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(conditions, {
  is_procedure: true,
})
