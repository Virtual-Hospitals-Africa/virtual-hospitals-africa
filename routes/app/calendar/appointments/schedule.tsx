import { assert } from 'std/assert/assert.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../types.ts'
import ScheduleForm from '../../../../components/calendar/ScheduleForm.tsx'
import * as patients from '../../../../db/models/patients.ts'
import { parseRequestAsserts } from '../../../../util/parseForm.ts'
import {
  availableSlots,
} from '../../../../shared/scheduling/getProviderAvailability.ts'
import Appointments from '../../../../components/calendar/Appointments.tsx'
import { ProviderAppointmentSlot } from '../../../../types.ts'
import { parseDateTime } from '../../../../util/date.ts'
import { hasName } from '../../../../util/haveNames.ts'
import {
  assertIsScheduleFormValues,
  makeAppointmentWeb,
} from '../../../../shared/scheduling/makeAppointment.ts'
import redirect from '../../../../util/redirect.ts'
import { assertOr400 } from '../../../../util/assertOr.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import { insertEvent } from '../../../../external-clients/google.ts'
import { EmployedHealthWorker } from '../../../../types.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'

type SearchFormValues = {
  provider_id?: string
  provider_name?: string
  patient_id?: string
  patient_name?: string
  date?: string
  reason?: string
}

export type ScheduleFormValues = {
  start: string
  end: string
  duration_minutes: number
  reason: string
  patient_id: string
  provider_ids: string[]
}

type SchedulePageProps = {
  healthWorker: EmployedHealthWorker
  slots?: ProviderAppointmentSlot[]
  patient_info?: { id: string; name: string }
}

function assertIsSearchFormValues(
  values: unknown,
): asserts values is SearchFormValues {
  assertOr400(isObjectLike(values))
  for (const key in values) {
    assertOr400(
      [
        'provider_id',
        'provider_name',
        'patient_id',
        'patient_name',
        'date',
        'reason',
      ].includes(key),
      `Invalid key ${key}`,
    )
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<SchedulePageProps> =
  {
    async POST(req, ctx) {
      const schedule = await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsScheduleFormValues,
      )

      await makeAppointmentWeb(
        ctx.state.trx,
        schedule,
        insertEvent,
      )
      return redirect('/app/calendar')
    },
  }

export default HealthWorkerHomePageLayout(
  'Schedule Appointment',
  async function SchedulePage(
    req,
    ctx,
  ) {
    const { healthWorker } = ctx.state

    const search = await parseRequestAsserts<SearchFormValues>(
      ctx.state.trx,
      req,
      assertIsSearchFormValues,
    )

    let patient_info
    if (!search.patient_id) {
      return ctx.render({ healthWorker })
    } else {
      const patient = await patients.getByID(ctx.state.trx, {
        id: search.patient_id,
      })

      patient_info = { id: patient.id, name: patient.name }
    }

    const gettingPatient = patients.getWithOpenEncounter(ctx.state.trx, {
      ids: [search.patient_id],
      health_worker_id: healthWorker.id,
    })

    const availability = await availableSlots(ctx.state.trx, {
      count: 10,
      dates: search.date ? [search.date] : undefined,
      employment_ids: search.provider_id ? [search.provider_id] : undefined,
    })

    const [patient] = await gettingPatient
    assert(hasName(patient))

    const slots: ProviderAppointmentSlot[] = availability.map((slot) => ({
      type: 'provider_appointment_slot',
      patient,
      id: `${slot.provider.provider_id}-${slot.start}`,
      duration_minutes: slot.duration_minutes,
      start: parseDateTime(new Date(slot.start), 'numeric'),
      end: parseDateTime(new Date(slot.end), 'numeric'),
      providers: [slot.provider],
    }))

    return (
      <div className='flex gap-x-4'>
        <ScheduleForm
          className='w-1/2'
          patient_info={patient_info}
        />
        {slots && (
          <Appointments
            headerText='Slots available'
            patient_id={patient_info?.id}
            appointments={slots}
            url={ctx.url}
            className='w-1/2'
          />
        )}
      </div>
    )
  },
)
