import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'
import family_history from '../../db/models/family_history.ts'

export const handler = jsonSearchHandler(family_history)
