import { assert } from 'std/assert/assert.ts'
import Appointments from '../../../../../components/calendar/Appointments.tsx'
import * as appointments from '../../../../../db/models/appointments.ts'
import type { RenderableAppointment } from '../../../../../types.ts'
import { PatientPage, type PatientPageProps } from './_middleware.tsx'
import {
  HealthWorkerGoogleClient,
} from '../../../../../external-clients/google.ts'
import { parseDateTime } from '../../../../../util/date.ts'
import { uniqBy } from '../../../../../util/uniq.ts'

export default PatientPage(
  async function AppointmentsPage({ ctx }: PatientPageProps) {
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
          appt.providers.flatMap((p) => p.organization),
          'id',
        )

        const organizations_with_addresses = organizations.filter((o) =>
          o.address
        )
        // TODO ensure this can't happen upstream
        assert(
          organizations_with_addresses.length <= 1,
          'Unsure how to handle an appointment booked with providers representing distinct organizations with physical addresses',
        )

        assert(
          first_provider,
          `Could not find a provider for a patient appointment ${appt.id}`,
        )
        const google_client = new HealthWorkerGoogleClient(ctx.state.trx, {
          ...first_provider,
          id: first_provider.health_worker_id,
        })
        const gcalItem = await google_client.getEvent(
          first_provider.gcal_appointments_calendar_id,
          appt.gcal_event_id,
        )
        assert(
          gcalItem,
          `Could not find event ${appt.gcal_event_id} in google calendar for provider ${first_provider.provider_id}`,
        )

        return {
          type: 'patient_appointment' as const,
          id: appt.id,
          patient: ctx.state.patient,
          duration_minutes: appt.duration_minutes,
          start: parseDateTime(appt.start, 'numeric'),
          end: parseDateTime(appt.end, 'numeric'),
          providers: appt.providers,
          physicalLocation: organizations_with_addresses.length
            ? {
              organization: organizations_with_addresses[0],
            }
            : undefined,
          virtualLocation: gcalItem.hangoutLink
            ? {
              href: gcalItem.hangoutLink,
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
