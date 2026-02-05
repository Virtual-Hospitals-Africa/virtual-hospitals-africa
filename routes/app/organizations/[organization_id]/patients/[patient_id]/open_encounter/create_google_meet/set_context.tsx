import { z } from 'zod'
import { HealthWorkerGoogleClient } from '../../../../../../../../external-clients/google.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import redirect from '../../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../../util/replaceParams.ts'
import { employeeDisplay } from '../../../../../../../../util/healthWorkerDisplay.ts'
import selfUrl from '../../../../../../../../util/selfUrl.ts'

const SetContextSchema = z.object({})

export const handler = postHandler(
  SetContextSchema,
  async (ctx: OpenEncounterWorkflowContext) => {
    const { encounter, employee, patient_id } = ctx.state

    const google_client = await HealthWorkerGoogleClient
      .fromHealthWorkerContext(ctx)

    const consultation_text = encounter.priority?.name ? `${encounter.priority?.name} unscheduled consultation` : 'Unscheduled consultation'

    const { display_name } = employeeDisplay(employee)

    const patient_link = selfUrl() + `/app/patients/${patient_id}`

    const google_meet = await google_client.createGoogleMeet({
      summary: `${consultation_text} with ${display_name}`,
      description: `Concerning patient ${patient_link}`,
    })

    const { first_incomplete_step } = await completeStep(ctx)

    return redirect(
      replaceParams(
        `/app/organizations/:organization_id/patients/:patient_id/open_encounter/create_google_meet/${first_incomplete_step}`,
        ctx.params,
      ),
      google_meet,
    )
  },
)

// deno-lint-ignore require-await
async function SetContextPage(ctx: OpenEncounterWorkflowContext) {
  const { encounter, employee } = ctx.state

  const consultation_text = encounter.priority?.name ? `${encounter.priority?.name} unscheduled consultation` : 'Unscheduled consultation'

  const { display_name } = employeeDisplay(employee)

  return (
    <p>A Google Meet will be created for: <strong>{consultation_text} with {display_name}</strong></p>
  )
}

export default OpenEncounterWorkflowPage(SetContextPage)
