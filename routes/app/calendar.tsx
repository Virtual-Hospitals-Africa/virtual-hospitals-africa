import { assert } from 'std/assert/assert.ts'
import { HealthWorkerGoogleClient } from '../../external-clients/google.ts'
import type { EmployeeAppointment, LoggedInHealthWorkerContext } from '../../types.ts'
import { appointments } from '../../db/models/appointments.ts'
import { parseDateTime, todayISOInJohannesburg } from '../../util/date.ts'
import AppointmentsCalendar from '../../components/calendar/AppointmentsCalendar.tsx'
import { promiseProps } from '../../util/promiseProps.ts'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'
import { assertOrRedirect } from '../../util/assertOr.ts'
import { warning } from '../../util/alerts.ts'

export default HealthWorkerHomePageLayout(
  'My Calendar',
  async function Calendar(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const google_client = await HealthWorkerGoogleClient
      .fromHealthWorkerContext(ctx)

    const today = todayISOInJohannesburg()
    // if there's no day in the query, use today in Johannesburg
    const day = ctx.url.searchParams.get('day') || today

    // Get calendar IDs from employment_calendars table
    const organization_calendars = await ctx.state.trx
      .selectFrom('employment_calendars')
      .where(
        'employment_id',
        'in',
        ctx.state.health_worker.organizations.map((o) => o.employment_id),
      )
      .innerJoin(
        'employment',
        'employment.id',
        'employment_calendars.employment_id',
      )
      .select([
        'organization_id',
        'gcal_appointments_calendar_id',
      ])
      .execute()

    const calendar_map = new Map(
      organization_calendars.map((cal) => [
        cal.organization_id,
        cal.gcal_appointments_calendar_id,
      ]),
    )

    const appointment_calendars = ctx.state.health_worker.organizations.map(
      (organization) => {
        const gcal_appointments_calendar_id = calendar_map.get(organization.id)
        assertOrRedirect(
          gcal_appointments_calendar_id,
          warning(
            `Please set your availability to manage appointments at ${organization.name}`,
            `/app/organizations/${organization.id}/availability`,
          ),
        )
        return gcal_appointments_calendar_id
      },
    )

    const { appointmentsOfHealthWorker, calendar_events } = await promiseProps({
      appointmentsOfHealthWorker: appointments.getWithPatientInfo(
        ctx.state.trx,
        {
          health_worker_id: ctx.state.health_worker.id,
        },
      ),
      calendar_events: Promise.all(
        appointment_calendars.map((calendar_id) =>
          google_client.getActiveEvents(calendar_id, {
            time_min: `${day}T00:00:00+02:00`,
            time_max: `${day}T23:59:59+02:00`,
          })
        ),
      ),
    })

    const events = calendar_events.flatMap((events) => events.items)

    const gcal_event_ids = new Set(events.map((event) => event.id))

    const appointments_of_provider_with_gcal_event_ids = appointmentsOfHealthWorker
      .filter(
        (appointment) => (
          assert(appointment.gcal_event_id), gcal_event_ids.has(appointment.gcal_event_id)
        ),
      )

    const employee_appointments: EmployeeAppointment[] = appointments_of_provider_with_gcal_event_ids.map(
      (appt) => {
        const gcal_item = events.find((event) => event.id === appt.gcal_event_id)
        if (!gcal_item) {
          throw new Error('Could not find gcal event for appointment')
        }

        const start_time = new Date(gcal_item.start.dateTime)
        const end_time = new Date(gcal_item.end.dateTime)
        const duration = end_time.getTime() - start_time.getTime()

        return {
          type: 'employee_appointment' as const,
          id: appt.id,
          patient: appt.patient,
          duration_minutes: Math.round(duration / (1000 * 60)),
          start: parseDateTime(start_time),
          end: parseDateTime(end_time),
          virtual_location: gcal_item.hangoutLink
            ? {
              href: gcal_item.hangoutLink,
            }
            : undefined,
        }
      },
    )
    return (
      <AppointmentsCalendar
        url={ctx.url}
        day={day}
        today={today}
        appointments={employee_appointments}
      />
    )
  },
)
