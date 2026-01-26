import { assert } from 'std/assert/assert.ts'
import Appointments from '../../../../../../../components/calendar/Appointments.tsx'
import { appointments } from '../../../../../../../db/models/appointments.ts'
import { google_tokens } from '../../../../../../../db/models/google_tokens.ts'
import type { RenderableAppointment } from '../../../../../../../types.ts'
import { PatientProfilePage } from './_middleware.tsx'
import { HealthWorkerGoogleClient } from '../../../../../../../external-clients/google.ts'
import { parseDateTime } from '../../../../../../../util/date.ts'
import { uniqBy } from '../../../../../../../util/uniqBy.ts'
import { organizationOf } from '../../../../../../../shared/employees.ts'

export default PatientProfilePage(
  'Appointments',
  async function AppointmentsPage(ctx) {
    const patient_appointments = await appointments.getForPatient(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        time_range: 'future',
      },
    )

    // TODO: don't recompute gcal information. This is pending our figuring out
    // how to schedule events via the scheduler and maybe having our app approved
    // by Google as a production app.
    const renderable_appointments: RenderableAppointment[] = await Promise.all(
      patient_appointments.map(async (appt) => {
        const first_provider = appt.providers[0]
        const organizations = uniqBy(
          appt.providers.map(organizationOf),
          'id',
        )

        const tokens = await google_tokens.getByEntityId(
          ctx.state.trx,
          'health_worker',
          first_provider.health_worker_id,
        )
        assert(tokens)
        const organizations_with_addresses = organizations.filter((o) => o.formatted_address)
        // TODO ensure this can't happen upstream
        assert(
          organizations_with_addresses.length <= 1,
          'Unsure how to handle an appointment booked with providers representing distinct organizations with physical addresses',
        )

        assert(
          first_provider,
          `Could not find a provider for a patient appointment ${appt.id}`,
        )
        const google_client = new HealthWorkerGoogleClient(
          ctx.state.trx,
          {
            id: first_provider.health_worker_id,
            ...tokens,
          },
        )
        const gcal_item = await google_client.getEvent(
          first_provider.calendars.gcal_appointments_calendar_id,
          appt.gcal_event_id,
        )
        assert(
          gcal_item,
          `Could not find event ${appt.gcal_event_id} in google calendar for provider ${first_provider.employee_id}`,
        )

        return {
          type: 'patient_appointment' as const,
          id: appt.id,
          patient: ctx.state.patient,
          duration_minutes: appt.duration_minutes,
          start: parseDateTime(appt.start),
          end: parseDateTime(appt.end),
          providers: appt.providers,
          physical_location: organizations_with_addresses.length
            ? {
              organization: organizations_with_addresses[0],
            }
            : undefined,
          virtual_location: gcal_item.hangoutLink
            ? {
              href: gcal_item.hangoutLink,
            }
            : undefined,
        }
      }),
    )

    return (
      <Appointments
        headerText='Upcoming patient appointments'
        patient_id={ctx.state.patient.id}
        appointments={renderable_appointments}
        url={ctx.url}
        className='mt-4'
      />
    )
  },
)
