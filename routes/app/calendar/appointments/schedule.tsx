import ScheduleForm from '../../../../components/calendar/ScheduleForm.tsx'
import * as patients from '../../../../db/models/patients.ts'
import { parseRequest } from '../../../../backend/parseForm.ts'
import { availableSlots } from '../../../../backend/scheduling/getProviderAvailability.ts'
import Appointments from '../../../../components/calendar/Appointments.tsx'
import { ProviderAppointmentSlot } from '../../../../types.ts'
import { parseDateTime } from '../../../../util/date.ts'
import { makeAppointmentWeb } from '../../../../backend/scheduling/makeAppointment.ts'
import redirect from '../../../../util/redirect.ts'
import { insertEvent } from '../../../../external-clients/google.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { promiseProps } from '../../../../util/promiseProps.ts'
import { postHandler } from '../../../../backend/postHandler.ts'
import z from 'zod'
import { positive_integer } from '../../../../util/validators.ts'

const ScheduleFormSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  duration_minutes: positive_integer,
  reason: z.string(),
  patient_id: z.string().uuid(),
  provider_ids: z.string().uuid().array(),
})

const SearchSchema = z.object({
  provider_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  provider_name: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  patient_name: z.string().uuid().optional(),
  date: z.string().uuid().optional(),
  reason: z.string().uuid().optional(),
})

export const handler = postHandler(
  ScheduleFormSchema,
  async (ctx, form_values) => {
    await makeAppointmentWeb(
      ctx.state.trx,
      form_values,
      insertEvent,
    )
    return redirect('/app/calendar')
  },
)

export default HealthWorkerHomePageLayout(
  'Schedule Appointment',
  async function SchedulePage(
    ctx,
  ) {
    const search = await parseRequest(
      ctx.req,
      SearchSchema.parse,
    )

    const { patient, availability } = await promiseProps({
      patient: search.patient_id
        ? patients.getByIdCompletedRegistration(
          ctx.state.trx,
          search.patient_id,
        )
        : Promise.resolve(undefined),
      availability: search.provider_id
        ? availableSlots(ctx.state.trx, {
          count: 10,
          dates: search.date ? [search.date] : undefined,
          employment_ids: [search.provider_id],
        })
        : Promise.resolve([]),
    })

    const slots: ProviderAppointmentSlot[] = patient
      ? availability.map((slot) => ({
        type: 'provider_appointment_slot',
        patient,
        id: `${slot.provider.employee_id}-${slot.start}`,
        duration_minutes: slot.duration_minutes,
        start: parseDateTime(new Date(slot.start)),
        end: parseDateTime(new Date(slot.end)),
        providers: [slot.provider],
      }))
      : []

    return (
      <div className='flex gap-x-4'>
        <ScheduleForm
          className='w-1/2'
          patient={patient}
        />
        {slots && (
          <Appointments
            headerText='Slots available'
            patient_id={patient?.id}
            appointments={slots}
            url={ctx.url}
            className='w-1/2'
          />
        )}
      </div>
    )
  },
)
