import { LoggedInHealthWorkerContext } from '../../../types.ts'
import redirect from '../../../util/redirect.ts'
import { replaceParams } from '../../../util/replaceParams.ts'

// deno-lint-ignore require-await
export default async function PatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  return redirect(
    replaceParams('/app/patients/:patient_id/profile/summary', ctx.params),
  )
}
