import { snomed_warning_signs } from '../../../db/models/snomed_warning_signs.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_warning_signs)
