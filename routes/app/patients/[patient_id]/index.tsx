import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'
import { replaceParams } from '../../../../util/replaceParams.ts'
import { Handlers } from 'fresh/compat'

export const handler: Handlers<unknown, LoggedInHealthWorkerContext['state']> = {
  GET: (ctx) =>
    redirect(
      replaceParams('/app/patients/:patient_id/profile/summary', ctx.params),
    ),
}
