import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'
import symptoms from '../../db/models/symptoms.ts'

export const handler = jsonSearchHandler(symptoms)
