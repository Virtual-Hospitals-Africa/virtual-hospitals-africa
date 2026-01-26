import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { HealthWorkerGoogleClient } from '../../../../../../../external-clients/google.ts'
import { preferredName } from '../../../../../../../util/asNames.ts'

const CreateGoogleMeetSchema = z.object({})

export const handler = postHandler(
  CreateGoogleMeetSchema,
  async (ctx: OpenEncounterContext) => {
    const { encounter } = ctx.state

    const google_client = await HealthWorkerGoogleClient
      .fromHealthWorkerContext(ctx)

    const patient_name = preferredName(encounter.patient, 'patient')
    const { hangoutLink } = await google_client.createGoogleMeet(
      `Meeting with ${patient_name}`,
      `Virtual consultation with ${patient_name}`,
    )

    return new Response(
      JSON.stringify({ hangoutLink }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
)
