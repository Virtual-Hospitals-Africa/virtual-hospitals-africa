import { describe, it } from 'std/testing/bdd.ts'
import { ENCOUNTER_STEPS } from '../../../shared/encounter.ts'

describe(
  '/app/patients/[patient_id]/encounters/[encounter_id]',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('has a .tsx file for every declared encounter step', async () => {
      await Promise.all(ENCOUNTER_STEPS.map(async (step) => {
        const path =
          `routes/app/patients/[patient_id]/encounters/[encounter_id]/${step}.tsx`
        await Deno.readFile(path)
      }))
    })
  },
)
