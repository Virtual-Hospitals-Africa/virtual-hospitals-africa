import { icd10 } from '../../db/models/icd10.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(icd10)
