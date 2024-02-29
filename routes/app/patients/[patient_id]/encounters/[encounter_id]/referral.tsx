import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  // deno-lint-ignore require-await
  async POST(_req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

// deno-lint-ignore require-await
export default async function ReferralPage(
  _req: Request,
  ctx: EncounterContext,
) {
  return (
    <EncounterLayout ctx={ctx}>
      <FormButtons />
    </EncounterLayout>
  )
}
