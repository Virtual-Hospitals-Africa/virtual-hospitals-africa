import { snomed_concept_body_structure } from '../../../db/models/snomed_concept_body_structure.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_concept_body_structure)
