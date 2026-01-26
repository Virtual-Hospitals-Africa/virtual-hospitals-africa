import { z } from 'zod'
import { HealthWorkerGoogleClient } from '../../../../../../../../external-clients/google.ts'
import { employees } from '../../../../../../../../db/models/employees.ts'
import { GCalEvent, RenderedEmployee } from '../../../../../../../../types.ts'
import { alert } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import InviteParticipantsList from '../../../../../../../../islands/InviteParticipantsList.tsx'
import { sql } from 'kysely'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'

type EmployeeWithPresence = RenderedEmployee & {
  at_work: boolean
}

const InviteParticipantsSchema = z.object({
  participant_emails: z.string().array(),
})

async function getEmployeesWithPresence(
  ctx: OpenEncounterWorkflowContext,
): Promise<{
  facility_employees: EmployeeWithPresence[]
  hospital_employees: EmployeeWithPresence[]
}> {
  const { trx, organization } = ctx.state

  // Get employees at current facility
  const facility_employees_results = await employees.baseQuery(trx)
    .where('employment.organization_id', '=', organization.id)
    .leftJoin(
      'employment_presence',
      'employment_presence.id',
      'employment.id',
    )
    .select([
      sql<boolean>`COALESCE(employment_presence.at_work, false)`.as('at_work'),
    ])
    .execute()

  const facility_employees = [] as EmployeeWithPresence[]
  for (const result of facility_employees_results) {
    const formatted = employees.formatResult(result)
    facility_employees.push({
      ...formatted,
      at_work: result.at_work,
    })
  }

  const nearest_hospital_id = TEST_ORGANIZATION_UUIDS.ZA.hospital
  // // Get patient's nearest hospital
  // const nearest_hospital = await patient_nearest_organization.get(trx, {
  //   patient_id,
  // })

  const hospital_employees = [] as EmployeeWithPresence[]
  if (nearest_hospital_id !== organization.id) {
    const hospital_employees_results = await employees.baseQuery(trx)
      .where('employment.organization_id', '=', nearest_hospital_id)
      .where('employment.profession', 'in', ['doctor', 'nurse'])
      .leftJoin(
        'employment_presence',
        'employment_presence.id',
        'employment.id',
      )
      .select([
        sql<boolean>`COALESCE(employment_presence.at_work, false)`.as('at_work'),
      ])
      .execute()

    for (const result of hospital_employees_results) {
      const formatted = employees.formatResult(result)
      hospital_employees.push({
        ...formatted,
        at_work: result.at_work,
      })
    }
  }

  return { facility_employees, hospital_employees }
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
