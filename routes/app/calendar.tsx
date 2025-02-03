import { assert } from 'std/assert/assert.ts'
import { HealthWorkerGoogleClient } from '../../external-clients/google.ts'
import type {
  LoggedInHealthWorkerContext,
  ProviderAppointment,
} from '../../types.ts'
import { getWithPatientInfo as getAppointments } from '../../db/models/appointments.ts'
import { parseDateTime, todayISOInHarare } from '../../util/date.ts'
import AppointmentsCalendar from '../../components/calendar/AppointmentsCalendar.tsx'
import { promiseProps } from '../../util/promiseProps.ts'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'
import { assertOrRedirect } from '../../util/assertOr.ts'
import { warning } from '../../util/alerts.ts'

export default HealthWorkerHomePageLayout(
  'My Calendar',
  async function Calendar(
    _req: Request,
    ctx: LoggedInHealthWorkerContext,
  ) {
    const googleClient = HealthWorkerGoogleClient.fromCtx(ctx)

    const today = todayISOInHarare()
    // if there's no day in the query, use today in Harare
    const day = ctx.url.searchParams.get('day') || today

    const appointment_calendars = ctx.state.healthWorker.employment.map(
      ({ organization, gcal_appointments_calendar_id }) => {
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
      appointmentsOfHealthWorker: getAppointments(ctx.state.trx, {
        health_worker_id: ctx.state.healthWorker.id,
      }),
      calendar_events: Promise.all(
        appointment_calendars.map((calendar_id) =>
          googleClient.getActiveEvents(calendar_id, {
            timeMin: `${day}T00:00:00+02:00`,
            timeMax: `${day}T23:59:59+02:00`,
          })
        ),
      ),
    })

    const events = calendar_events.flatMap((events) => events.items)

    const gcalEventIds = new Set(events.map((event) => event.id))

    const appointmentsOfProviderWithGcalEventIds = appointmentsOfHealthWorker
      .filter(
        (appointment) => (
          assert(appointment.gcal_event_id),
            gcalEventIds.has(appointment.gcal_event_id)
        ),
      )

    const appointments: ProviderAppointment[] =
      appointmentsOfProviderWithGcalEventIds.map(
        (appt) => {
          const gcalItem = events.find((event) =>
            event.id === appt.gcal_event_id
          )
          if (!gcalItem) {
            throw new Error('Could not find gcal event for appointment')
          }

          const startTime = new Date(gcalItem.start.dateTime)
          const endTime = new Date(gcalItem.end.dateTime)
          const duration = endTime.getTime() - startTime.getTime()

          return {
            type: 'provider_appointment' as const,
            id: appt.id,
            patient: appt.patient,
            duration_minutes: Math.round(duration / (1000 * 60)),
            start: parseDateTime(startTime, 'numeric'),
            end: parseDateTime(endTime, 'numeric'),
            virtualLocation: gcalItem.hangoutLink
              ? {
                href: gcalItem.hangoutLink,
              }
              : undefined,
          }
        },
      )
    return (
      <AppointmentsCalendar
        url={ctx.url}
        appointments={appointments}
        day={day}
        today={today}
      />
    )
  },
)
