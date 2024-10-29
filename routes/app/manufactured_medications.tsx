import manufactured_medications from '../../db/models/manufactured_medications.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(manufactured_medications)
