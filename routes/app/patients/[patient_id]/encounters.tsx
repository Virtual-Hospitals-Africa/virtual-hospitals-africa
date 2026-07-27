import type { LoggedInHealthWorkerContext } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'
import { replaceParams } from '../../../../util/replaceParams.ts'

export const handler = {
  GET: (ctx: LoggedInHealthWorkerContext) =>
    redirect(
      replaceParams('/app/patients/:patient_id/profile/visits', ctx.params),
    ),
}
