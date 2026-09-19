import { insurance_network } from '../../db/models/insurance_network.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(insurance_network)
