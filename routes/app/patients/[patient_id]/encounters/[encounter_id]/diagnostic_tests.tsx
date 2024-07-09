import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'

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

export default EncounterPage(
  function DiagnosticTestsPage(
    _props: EncounterPageChildProps,
  ) {
    return <p>TODO</p>
  },
)
