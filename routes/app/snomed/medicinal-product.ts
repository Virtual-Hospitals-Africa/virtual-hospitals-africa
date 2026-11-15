import { snomed_concept_medicinal_product } from '../../../db/models/snomed_concept_medicinal_product.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_concept_medicinal_product)
