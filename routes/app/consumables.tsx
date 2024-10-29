import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'
import consumables from '../../db/models/consumables.ts'

export const handler = jsonSearchHandler(consumables)
