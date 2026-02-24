import { recommended_doses } from '../../db/models/recommended_doses.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(recommended_doses)
