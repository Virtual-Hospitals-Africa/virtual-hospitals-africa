import { snomed_model } from '../../../db/models/snomed.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_model, {
  categories: ['disorder', 'finding', 'morphologic abnormality'],
}, {
  verbose: true,
})
