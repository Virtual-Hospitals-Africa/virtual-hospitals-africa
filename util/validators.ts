import { z } from 'zod'
import { parsePhoneNumber } from 'awesome-phonenumber'

export const national_id_number = z.string().regex(/^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/i)
  .transform(s => s.toUpperCase())

export const phone_number = z.string().or(z.number())
  .transform(data => String(data))
  .transform(data => data.startsWith('+') ? data : `+${data}`)
  .transform(data => parsePhoneNumber(data))
  .refine(
    data => data.valid,
    {
      message: "Invalid phone number"
    }
  )
  .transform(data => data.number.e164)

export const gender = z.enum(['male', 'female', 'non-binary'])

export const varchar255 = z.string().min(1).max(255)
