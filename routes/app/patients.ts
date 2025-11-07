import * as patients from '../../db/models/patients.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(patients, {})
