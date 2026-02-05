import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { startWorkflow } from './start-workflow.tsx'
import redirect from '../../../../../../../util/redirect.ts'

const CreateGoogleMeetSchema = z.object({})

export const handler = postHandler(
  CreateGoogleMeetSchema,
  async (ctx: OpenEncounterContext) => {
    const next_url = await startWorkflow(
      ctx,
      'create_google_meet',
      {
        planning: 'create_anew_every_time',
        patient_presence: 'leave_in_current_workflow',
      },
    )

    return redirect(next_url)
  },
)
