import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import {
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
  ReturnedSqlRow,
} from '../../../../types.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import ScheduleForm from '../../../../islands/schedule-form.tsx'
import * as health_workers from '../../../../db/models/health_workers.ts'
import * as patients from '../../../../db/models/patients.ts'
import { parseRequestAsserts } from '../../../../util/parseForm.ts'
import {
  availableSlots,
} from '../../../../shared/scheduling/getHealthWorkerAvailability.ts'
import Appointments from '../../../../components/calendar/Appointments.tsx'
import { HealthWorkerAppointmentSlot } from '../../../../types.ts'
import { parseDate } from '../../../../util/date.ts'
import { hasName } from '../../../../util/haveNames.ts'
import {
  assertIsScheduleFormValues,
  makeAppointmentWeb,
} from '../../../../shared/scheduling/makeAppointment.ts'
import redirect from '../../../../util/redirect.ts'
import { assertOr400 } from '../../../../util/assertOr.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import { insertEvent } from '../../../../external-clients/google.ts'

type SearchFormValues = {
  health_worker_id?: number
  health_worker_name?: string
  patient_id?: number
  patient_name?: string
  date?: string
  reason?: string
}

export type ScheduleFormValues = {
  start: string
  end: string
  durationMinutes: number
  reason: string
  patient_id: number
  health_worker_ids: number[]
}

type SchedulePageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
  slots?: HealthWorkerAppointmentSlot[]
}

function assertIsSearchFormValues(
  values: unknown,
): asserts values is SearchFormValues {
  assertOr400(isObjectLike(values))
  for (const key in values) {
    assertOr400(
      [
        'health_worker_id',
        'health_worker_name',
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
    async GET(req, ctx) {
      const { healthWorker } = ctx.state

      const search = await parseRequestAsserts<SearchFormValues>(
        ctx.state.trx,
        req,
        assertIsSearchFormValues,
      )

      if (!search.patient_id) {
        return ctx.render({ healthWorker })
      }
      const gettingPatient = patients.getWithOpenEncounter(ctx.state.trx, {
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

export default function SchedulePage(
  props: PageProps<SchedulePageProps>,
) {
  return (
    <Layout
      title='Schedule Appointment'
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='home page'
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
