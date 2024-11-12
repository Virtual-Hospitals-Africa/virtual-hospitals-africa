import { z } from 'zod'
import { parsePhoneNumber } from 'awesome-phonenumber'
import isNumber from './isNumber.ts'
import generateUUID from './uuid.ts'

export const national_id_number = z.string().regex(
  /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/i,
)
  .transform((s) => s.toUpperCase())

export const e164_phone_number = z.string().or(z.number())
  .transform((data) => String(data))
  .transform((data) => data.startsWith('+') ? data : `+${data}`)
  .transform((data) => parsePhoneNumber(data))
  .refine(
    (data) => data.valid,
    {
      message: 'Invalid phone number',
    },
  )
  .transform((data) => data.number.e164)

export const international_phone_number = z.string().or(z.number())
  .transform((data) => String(data))
  .transform((data) => data.startsWith('+') ? data : `+${data}`)
  .transform((data) => parsePhoneNumber(data))
  .refine(
    (data) => data.valid,
    {
      message: 'Invalid phone number',
    },
  )
  .transform((data) => data.number.international)

export const gender = z.enum(['male', 'female', 'non-binary'])

export const varchar255 = z.string().min(1).max(255)

export const positive_number = z.number().or(z.string())
  .transform((n) => isNumber(n) ? n : parseFloat(n))
  .refine((n) => isNumber(n) && n > 0, {
    message: 'Expected a positive number',
  })

export const generated_uuid = z.string().uuid().optional().transform((v) =>
  v || generateUUID()
)
