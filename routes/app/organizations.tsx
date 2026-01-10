import { organizations } from '../../db/models/organizations.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(organizations)
