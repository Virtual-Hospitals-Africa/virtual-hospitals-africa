import * as drugs from '../../db/models/drugs.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(drugs)
