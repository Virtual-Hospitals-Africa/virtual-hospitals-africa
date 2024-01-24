import { EncounterContext, EncounterLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  POST(_req, _ctx: EncounterContext) {
    throw new Error('Not implemented')
  },
}

// deno-lint-ignore require-await
export default async function PrescriptionsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  return (
    <EncounterLayout ctx={ctx}>
      <FormButtons />
    </EncounterLayout>
  )
}
