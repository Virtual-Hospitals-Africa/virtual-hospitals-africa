import procurers from '../../db/models/procurers.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(procurers)
