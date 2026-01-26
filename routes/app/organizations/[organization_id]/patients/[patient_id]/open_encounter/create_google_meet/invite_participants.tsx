import { z } from 'zod'
import { HealthWorkerGoogleClient } from '../../../../../../../../external-clients/google.ts'
import { employees } from '../../../../../../../../db/models/employees.ts'
import { patient_nearest_organization } from '../../../../../../../../db/models/patient_nearest_organization.ts'
import { RenderedEmployee } from '../../../../../../../../types.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import InviteParticipantsList from '../../../../../../../../islands/InviteParticipantsList.tsx'
import { sql } from 'kysely'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'

type EmployeeWithPresence = RenderedEmployee & {
  at_work: boolean
}

const InviteParticipantsSchema = z.object({
  participant_emails: z.string().array()
})

async function getEmployeesWithPresence(
  ctx: OpenEncounterWorkflowContext,
): Promise<{
  facility_employees: EmployeeWithPresence[]
  hospital_employees: EmployeeWithPresence[]
}> {
  const { trx, organization, patient_id } = ctx.state

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

  // Get patient's nearest hospital
  const nearest_hospital = await patient_nearest_organization.get(trx, {
    patient_id,
  })

  const hospital_employees = [] as EmployeeWithPresence[]
  if (nearest_hospital && nearest_hospital.id !== organization.id) {
    const hospital_employees_results = await employees.baseQuery(trx)
      .where('employment.organization_id', '=', nearest_hospital.id)
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
    const { encounter, organization } = ctx.state
    const url = new URL(ctx.req.url)
    const hangout_link = url.searchParams.get('hangoutLink')

    if (!hangout_link) {
      throw new Error('hangoutLink is required')
    }

    const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx)

    const consultation_text = encounter.priority?.name ? `${encounter.priority?.name} unscheduled consultation` : 'Unscheduled consultation'

    const start = new Date()
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    // Create calendar event with attendees
    await google_client.sendCalendarInvite({
      summary: consultation_text,
      description: `Virtual consultation\n\nJoin: ${hangout_link}`,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'Africa/Johannesburg',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'Africa/Johannesburg',
      },
      attendees: form_values.participant_emails.map((email) => ({
        email,
      })),
    })

    return redirect(
      success(
        `Invited ${form_values.participant_emails.length} participant${form_values.participant_emails.length === 1 ? '' : 's'} to the consultation`,
        `/app/organizations/${organization.id}/calendar`,
      ),
    )
  },
)

async function CreateGoogleMeetInviteParticipantsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const url = new URL(ctx.req.url)
  const hangout_link = url.searchParams.get('hangoutLink')

  if (!hangout_link) {
    throw new Error('hangoutLink is required')
  }

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
