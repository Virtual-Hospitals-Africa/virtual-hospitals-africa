import { z } from 'zod'
import { HealthWorkerGoogleClient } from '../../../../../../../../external-clients/google.ts'
import { GCalEvent } from '../../../../../../../../types.ts'
import { alert } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import InviteParticipantsList from '../../../../../../../../islands/InviteParticipantsList.tsx'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowPostContext } from '../../../../../../../../types.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { pluralize } from '../../../../../../../../util/pluralize.ts'

const InviteParticipantsSchema = z.object({
  participant_emails: z.string().array(),
})

export const handler = postHandler(
  InviteParticipantsSchema,
  async (ctx, form_values) => {
    const url = new URL(ctx.req.url)
    const hangout_link = url.searchParams.get('hangout_link')
    const html_link = url.searchParams.get('html_link')
    const event_id = url.searchParams.get('event_id')

    assertOr400(hangout_link, 'hangout_link is required')
    assertOr400(html_link, 'html_link is required')
    assertOr400(event_id, 'event_id is required')

    const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx)

    // Get the existing event
    const existing_event = await google_client.getEvent('primary', event_id)

    // Update the event to add attendees (merging with existing attendees)
    await google_client.updateEvent({
      calendarId: 'primary',
      eventId: event_id,
      details: {
        ...existing_event,
        attendees: [
          ...(existing_event.attendees || []),
          ...form_values.participant_emails.map((email) => ({ email })),
        ] as unknown as GCalEvent['attendees'],
      },
      sendUpdates: 'all',
    })

    await completeLastStep(ctx)

    return redirect(
      alert(
        {
          level: 'success',
          message: `Invited ${pluralize('participant', form_values.participant_emails.length)} to the consultation`,
          actions: [
            {
              text: 'Join the call',
              href: hangout_link,
              target: '_blank',
            },
          ],
        },
        ctx.state.open_encounter_pathname,
      ),
    )
  },
)

async function CreateGoogleMeetInviteParticipantsPage(
  ctx: OpenEncounterWorkflowPostContext,
) {
  const url = new URL(ctx.req.url)
  const hangout_link = url.searchParams.get('hangout_link')
  const html_link = url.searchParams.get('html_link')
  const event_id = url.searchParams.get('event_id')

  assertOr400(hangout_link, 'hangout_link is required')
  assertOr400(html_link, 'html_link is required')
  assertOr400(event_id, 'event_id is required')

  const { clinic_employees, hospital_employees } = await employees_presence.getForClinicAssumingTestHospital(
    ctx.state.trx,
    {
      organization_id: ctx.state.organization_id,
      excluding_health_worker: {
        health_worker_id: ctx.state.health_worker_id,
        seniority_order: ctx.state.organization_employment.seniority_order,
        at_work: true,
      },
    },
  )

  return (
    <InviteParticipantsList
      clinic_employees={clinic_employees}
      hospital_employees={hospital_employees}
    />
  )
}

export default OpenEncounterWorkflowPage(CreateGoogleMeetInviteParticipantsPage)
