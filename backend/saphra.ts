import { z } from 'zod'
import { parseWithValues } from '../util/assertMatches.ts'
import shuffle from '../util/shuffle.ts'

const contents = new TextDecoder().decode(Deno.readFileSync('./db/resources/sahpra.json'))

const date = z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).transform((d) => d.split('/').join('-'))

const schema = z.object({
  'secureId': z.string(),
  'applicantName': z.string(),
  'appSecureId': z.string(),
  'application_no': z.string(),
  'licence_no': z.string(),
  'productName': z.string(),
  'status': z.enum(['Registered', 'Registrered', 'Old Medicine', 'Canceled']).transform((status) => status === 'Registrered' ? 'Registered' : status),
  'expiryDate': date,
  'reg_date': date,
  'ingredient': z.string(),
  'therapeutic_area': z.string().nullable(),
  'api': z.string(),
})

export const za_medications = parseWithValues(schema.array(), JSON.parse(contents))
