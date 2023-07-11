import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  Maybe,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import ScheduleForm from '../../../../islands/schedule-form.tsx'
import * as health_workers from '../../../../db/models/health_workers.ts'
import * as patients from '../../../../db/models/patients.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import {
  availableSlots,
} from '../../../../scheduling/getHealthWorkerAvailability.ts'
import Appointments from '../../../../components/calendar/Appointments.tsx'
import { HealthWorkerAppointmentSlot } from '../../../../types.ts'
import { parseDate } from '../../../../util/date.ts'
import { hasName } from '../../../../util/haveNames.ts'
import { makeAppointmentWeb } from '../../../../scheduling/makeAppointment.ts'
import redirect from '../../../../util/redirect.ts'

type SearchFormValues = {
  health_worker_id?: number
  patient_id?: number
  date?: string
}

type ScheduleFormValues = {
  start: Date
  end: Date
  durationMinutes: number
  reason: string
  patient_id: number
  health_worker_ids: number[]
}

type SchedulePageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
  slots?: HealthWorkerAppointmentSlot[]
}

// TODO implement
function isSearchFormValues(
  _values: unknown,
): _values is SearchFormValues {
  return true
}

function isScheduleFormValues(
  values: unknown,
): values is ScheduleFormValues {
  return (
    !!values && typeof values === 'object' &&
    'start' in values && values.start instanceof Date &&
    'end' in values && values.end instanceof Date &&
    'durationMinutes' in values && typeof values.durationMinutes === 'number' &&
    'reason' in values && typeof values.reason === 'string' &&
    'patient_id' in values && typeof values.patient_id === 'number' &&
    'health_worker_ids' in values && Array.isArray(values.health_worker_ids) &&
    values.health_worker_ids.every((id) => typeof id === 'number')
  )
}

export const handler: LoggedInHealthWorkerHandler<SchedulePageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const search = await parseRequest<SearchFormValues>(
      req,
      {},
      isSearchFormValues,
    )

    if (!search.patient_id) {
      return ctx.render({ healthWorker })
    }
    const gettingPatient = patients.getWithMedicalRecords(ctx.state.trx, {
      ids: [search.patient_id],
    })

    let toScheduleWith: Maybe<
      ReturnedSqlRow<
        HealthWorkerWithGoogleTokens
      >
    >

    if (search.health_worker_id) {
      toScheduleWith = await health_workers.getWithTokensById(
        ctx.state.trx,
        search.health_worker_id,
      )

      assert(toScheduleWith)
    }

    const availability = await availableSlots(ctx.state.trx, {
      count: 10,
      dates: search.date ? [search.date] : undefined,
      health_workers: toScheduleWith ? [toScheduleWith] : undefined,
    })

    const [patient] = await gettingPatient
    assert(hasName(patient))

    const slots: HealthWorkerAppointmentSlot[] = availability.map((slot) => ({
      type: 'slot',
      patient,
      id: `${slot.health_worker.id}-${slot.start}`,
      durationMinutes: slot.durationMinutes,
      start: parseDate(new Date(slot.start), 'numeric'),
      end: parseDate(new Date(slot.end), 'numeric'),
      health_workers: [slot.health_worker],
    }))

    return ctx.render({
      healthWorker,
      slots,
    })
  },
  async POST(req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const schedule = await parseRequest<ScheduleFormValues>(
      req,
      {},
      isScheduleFormValues,
    )

    await makeAppointmentWeb(ctx.state.trx, schedule)
    return redirect('/app/calendar')
  },
}

export default function SchedulePage(
  props: PageProps<SchedulePageProps>,
) {
  return (
    <Layout
      title='Schedule Appointment'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        <ScheduleForm />
        {props.data.slots && (
          <Appointments
            headerText='Slots available'
            appointments={props.data.slots}
            url={props.url}
          />
        )}
      </Container>
    </Layout>
  )
}
