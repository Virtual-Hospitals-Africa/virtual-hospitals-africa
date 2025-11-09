import z from 'zod'

export const ProfessionSchema = z.enum([
  'admin',
  'doctor',
  'nurse',
  'receptionist',
])
