import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import { HealthWorkerGoogleClient } from '../../external-clients/google.ts'
import {
  CalendarPageProps,
  HealthWorkerAppointment,
  LoggedInHealthWorkerHandler,
} from '../../types.ts'
import { getWithPatientInfo as getAppointments } from '../../db/models/appointments.ts'
import { parseDate, todayISOInHarare } from '../../util/date.ts'
import AppointmentsCalendar from '../../components/calendar/AppointmentsCalendar.tsx'
import { Container } from '../../components/library/Container.tsx'
import Layout from '../../components/library/Layout.tsx'

export const handler: LoggedInHealthWorkerHandler<CalendarPageProps> = {
  async GET(req, ctx) {
    const { healthWorker } = ctx.state
    const googleClient = new HealthWorkerGoogleClient(ctx)

    const today = todayISOInHarare()
    // if there's no day in the query, use today in Harare
    const day = new URL(req.url).searchParams.get('day') || today

    // get filtered calendar events here
    const gettingEvents = googleClient.getActiveEvents(
      ctx.state.session.data.gcal_appointments_calendar_id,
      {
        timeMin: `${day}T00:00:00+02:00`,
        timeMax: `${day}T23:59:59+02:00`,
      },
    )

    assert(ctx.state.session.data.id)
    const appointmentsOfHealthWorker = await getAppointments(ctx.state.trx, {
      health_worker_id: ctx.state.session.data.id,
    })
    const events = await gettingEvents

    const gcalEventIds = new Set(events.items.map((item) => item.id))

    const appointmentsOfHealthWorkerWithGcalEventIds =
      appointmentsOfHealthWorker.filter(
        (appointment) => (
          assert(appointment.gcal_event_id),
            gcalEventIds.has(appointment.gcal_event_id)
        ),
      )

    const appointments = appointmentsOfHealthWorkerWithGcalEventIds.map(
      (appt) => {
        const gcalItem = events.items.find((item) =>
          item.id === appt.gcal_event_id
        )
        if (!gcalItem) {
          throw new Error('Could not find gcal event for appointment')
        }

        const startTime = new Date(gcalItem.start.dateTime)
        const endTime = new Date(gcalItem.end.dateTime)
        const duration = endTime.getTime() - startTime.getTime()

        return {
          type: 'appointment',
          id: appt.id,
          patient: { ...appt.patient, age: 30 },
          durationMinutes: Math.round(duration / (1000 * 60)),
          start: parseDate(startTime, 'numeric'),
          end: parseDate(endTime, 'numeric'),
          virtualLocation: gcalItem.hangoutLink && {
            href: gcalItem.hangoutLink,
          },
        } as HealthWorkerAppointment
      },
    )

    return ctx.render({ appointments, day, today, healthWorker })
  },
}

export default function Calendar(
  props: PageProps<CalendarPageProps>,
) {
  return (
    <Layout
      title='My Calendar'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <AppointmentsCalendar url={props.url} {...props.data} />
      </Container>
    </Layout>
  )
}
