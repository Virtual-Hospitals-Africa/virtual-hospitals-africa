import { z } from 'zod'
import { HealthWorkerGoogleClient } from '../../../../../../../../external-clients/google.ts'
import { GCalEvent, RenderedEmployee } from '../../../../../../../../types.ts'
import { alert } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import InviteParticipantsList from '../../../../../../../../islands/InviteParticipantsList.tsx'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

type EmployeeWithPresence = RenderedEmployee & {
  at_work: boolean
}

const InviteParticipantsSchema = z.object({
  participant_emails: z.string().array(),
})

function getEmployeesWithPresence(
  ctx: OpenEncounterWorkflowContext,
): Promise<{
  facility_employees: EmployeeWithPresence[]
  hospital_employees: EmployeeWithPresence[]
}> {
  const { trx, organization_id, health_worker_id } = ctx.state
  // TODO get this for real
  const nearest_hospital_id = TEST_ORGANIZATION_UUIDS.ZA.hospital

  return promiseProps({
    facility_employees: employees_presence.findAll(trx, {
      organization_id,
      excluding_health_worker_id: health_worker_id,
    }),
    hospital_employees: employees_presence.findAll(trx, {
      organization_id: nearest_hospital_id,
      excluding_health_worker_id: health_worker_id,
    }),
  })
}

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
          message: `Invited ${form_values.participant_emails.length} participant${form_values.participant_emails.length === 1 ? '' : 's'} to the consultation`,
          actions: [
            {
              text: 'Join',
              href: hangout_link,
            },
          ],
        },
        ctx.state.open_encounter_pathname,
      ),
    )
  },
)

async function CreateGoogleMeetInviteParticipantsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const url = new URL(ctx.req.url)
  const hangout_link = url.searchParams.get('hangout_link')
  const html_link = url.searchParams.get('html_link')
  const event_id = url.searchParams.get('event_id')

  assertOr400(hangout_link, 'hangout_link is required')
  assertOr400(html_link, 'html_link is required')
  assertOr400(event_id, 'event_id is required')

  const { facility_employees, hospital_employees } = await getEmployeesWithPresence(ctx)

  return (
    <InviteParticipantsList
      facility_employees={facility_employees}
      hospital_employees={hospital_employees}
      hangout_link={hangout_link}
    />
  )
}

export default OpenEncounterWorkflowPage(CreateGoogleMeetInviteParticipantsPage)
