import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { startWorkflow } from './start-workflow.tsx'
// import { HealthWorkerGoogleClient } from '../../../../../external-clients/google.ts'
// import { preferredName } from '../../../../util/asNames.ts'
import { HealthWorkerGoogleClient } from '../../../../../../../external-clients/google.ts'
import { employeeDisplay } from '../../../../../../../util/healthWorkerDisplay.ts'
import selfUrl from '../../../../../../../util/selfUrl.ts'
import redirect from '../../../../../../../util/redirect.ts'
// import { employeeDisplay } from '../../../../../util/healthWorkerDisplay.ts'
// import selfUrl from '../../../../../util/selfUrl.ts'

const CreateGoogleMeetSchema = z.object({})

export const handler = postHandler(
  CreateGoogleMeetSchema,
  async (ctx: OpenEncounterContext) => {
    const { encounter, employee, patient_id } = ctx.state

    const google_client = await HealthWorkerGoogleClient
      .fromHealthWorkerContext(ctx)

    const consultation_text = encounter.priority?.name ? `${encounter.priority?.name} unscheduled consultation` : 'Unscheduled consultation'

    // const patient_name = preferredName(encounter.patient, 'patient')

    const { display_name } = employeeDisplay(employee)

    const patient_link = selfUrl() + `/app/patients/${patient_id}`

    const next_url = await startWorkflow(
      ctx,
      'create_google_meet',
      {
        planning: 'create_anew_every_time',
        patient_presence: 'leave_in_current_workflow',
      },
    )

    const google_meet = await google_client.createGoogleMeet({
      summary: `${consultation_text} with ${display_name}`,
      description: `Concerning patient ${patient_link}`,
    })

    return redirect(next_url, google_meet)
  },
)
