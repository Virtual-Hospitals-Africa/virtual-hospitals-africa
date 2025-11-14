import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import {
  AvailabilityJSON,
  DayOfWeek,
  DeepPartial,
  GCalEvent,
  Time,
} from '../../../../types.ts'
import SetAvailabilityForm from '../../../../islands/availability-form.tsx'
import { HealthWorkerGoogleClient } from '../../../../external-clients/google.ts'
import {
  assertAllJohannesburg,
  convertToTime,
  formatJohannesburg,
  todayISOInJohannesburg,
} from '../../../../util/date.ts'
import { padTime } from '../../../../util/pad.ts'
import redirect from '../../../../util/redirect.ts'
import { parseDateTime } from '../../../../util/date.ts'
import { ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs } from '../../../logged-in.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { forEach } from '../../../../util/inParallel.ts'
import { postHandler } from '../../../../util/postHandler.ts'
import z from 'zod'
import { promiseProps } from '../../../../util/promiseProps.ts'
import { OrganizationContext } from './_middleware.ts'
import * as health_worker_organization_calenders from '../../../../db/models/employment_calendars.ts'
import {
  nonnegative_integer,
  positive_integer,
} from '../../../../util/validators.ts'

const days: Array<DayOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const short_to_long = {
  SU: 'Sunday' as const,
  MO: 'Monday' as const,
  TU: 'Tuesday' as const,
  WE: 'Wednesday' as const,
  TH: 'Thursday' as const,
  FR: 'Friday' as const,
  SA: 'Saturday' as const,
}

const toJohannesburg = (time: Time) => {
  const base_hour = time.hour % 12
  const hour = time.am_pm === 'am' ? base_hour : base_hour + 12
  const hour_str = padTime(hour)
  const minute_str = padTime(time.minute)
  return `${hour_str}:${minute_str}:00+02:00`
}

function* availabilityBlocks(
  availability: Partial<AvailabilityJSON>,
): Generator<DeepPartial<GCalEvent>> {
  const today = parseDateTime(todayISOInJohannesburg())
  const today_index = days.indexOf(today.weekday as DayOfWeek)
  for (const day of days) {
    const day_availability = availability[day]
    if (!day_availability) continue
    const day_index = days.indexOf(day)
    const day_offset = day_index - today_index
    const day_date = new Date(
      Date.UTC(
        parseInt(today.year),
        parseInt(today.month) - 1,
        parseInt(today.day),
      ),
    )
    day_date.setDate(day_date.getDate() + day_offset)
    const day_str = formatJohannesburg(day_date).split('T')[0]

    for (const time_window of day_availability) {
      const start = toJohannesburg(time_window.start)
      const end = toJohannesburg(time_window.end)

      yield {
        summary: 'Availability Block',
        start: {
          dateTime: `${day_str}T${start}`,
          timeZone: 'Africa/Johannesburg',
        },
        end: { dateTime: `${day_str}T${end}`, timeZone: 'Africa/Johannesburg' },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${day.slice(0, 2).toUpperCase()}`,
        ],
      }
    }
  }
}

const TimeSchema = z.object({
  hour: positive_integer.refine((hour) => hour >= 1 && hour <= 12, {
    message: 'expected an hour in the range 1-12',
  }),
  minute: nonnegative_integer.refine((minute) => minute >= 0 && minute <= 59, {
    message: 'expected a minute in the range 0-59',
  }),
  am_pm: z.enum(['am', 'pm']),
})

const TimeWindowSchema = z.object({
  start: TimeSchema,
  end: TimeSchema,
})

const AvailabilitySchema = z.object({
  Sunday: TimeWindowSchema.array().optional(),
  Monday: TimeWindowSchema.array().optional(),
  Tuesday: TimeWindowSchema.array().optional(),
  Wednesday: TimeWindowSchema.array().optional(),
  Thursday: TimeWindowSchema.array().optional(),
  Friday: TimeWindowSchema.array().optional(),
  Saturday: TimeWindowSchema.array().optional(),
})

async function writeCalendarsToGoogle(
  ctx: OrganizationContext,
  availability: Partial<AvailabilityJSON>,
) {
  // Get calendar ID from employment_calendars table
  const calendar_record = await ctx.state.trx
    .selectFrom('employment_calendars')
    .where('health_worker_id', '=', ctx.state.health_worker.id)
    .where('organization_id', '=', ctx.state.organization.id)
    .select('gcal_availability_calendar_id')
    .executeTakeFirst()

  let gcal_availability_calendar_id = calendar_record
    ?.gcal_availability_calendar_id

  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(
    ctx,
  )

  if (!gcal_availability_calendar_id) {
    const [calendars] =
      await ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs(
        ctx.state.trx,
        google_client,
        [ctx.state.organization.id],
      )
    await health_worker_organization_calenders.add(
      ctx.state.trx,
      ctx.state.health_worker.id,
      [calendars],
    )
    gcal_availability_calendar_id = calendars.gcal_availability_calendar_id
  }

  const existing_availability = await google_client.getActiveEvents(
    gcal_availability_calendar_id,
  )

  const existing_availability_events = existing_availability.items || []

  // Google rate limits you if you try to do these in parallel :(
  // TODO: revisit whether to clear all these out
  await forEach(
    existing_availability_events,
    (event) =>
      google_client.deleteEvent(gcal_availability_calendar_id, event.id),
  )

  await forEach(
    availabilityBlocks(availability),
    (event) => google_client.insertEvent(gcal_availability_calendar_id, event),
  )
}

export const handler = postHandler(
  AvailabilitySchema,
  async (ctx: OrganizationContext, form_values) => {
    const { health_worker, trx, organization } = ctx.state
    const from_url = !!ctx.url.searchParams.get('from_url')

    await promiseProps({
      marking_availability_set: health_worker_organization_calenders
        .markAvailabilitySet(
          trx,
          {
            health_worker_id: health_worker.id,
            organization_id: organization.id,
          },
        ),
      write_calendars_to_google: writeCalendarsToGoogle(
        ctx,
        form_values,
      ),
    })

    const success = encodeURIComponent(
      'Thanks! With your availability updated your coworkers can now book appointments with you and know when you are available 📆',
    )
    const next_page = from_url || '/app/calendar'
    return redirect(`${next_page}?success=${success}`)
  },
)

export default HealthWorkerHomePageLayout(
  'Set Availability',
  async function SetAvailability(
    // deno-lint-ignore no-explicit-any
    ctx: OrganizationContext<any>,
  ) {
    const { health_worker, organization } = ctx.state
    const from_url = ctx.url.searchParams.get('from_url')

    // Get calendar ID from employment_calendars table
    const calendar_record = await ctx.state.trx
      .selectFrom('employment_calendars')
      .where('health_worker_id', '=', health_worker.id)
      .where('organization_id', '=', organization.id)
      .select('gcal_availability_calendar_id')
      .executeTakeFirst()

    const gcal_availability_calendar_id = calendar_record
      ?.gcal_availability_calendar_id

    const google_client = await HealthWorkerGoogleClient
      .fromHealthWorkerContext(ctx)
    const events = gcal_availability_calendar_id
      ? await google_client.getActiveEvents(
        gcal_availability_calendar_id,
      )
      : { items: [] }

    const availability: AvailabilityJSON = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    }

    // If initially directed here by _middleware, but you already have availability in google calendar, mark that the availability is set
    if (events.items.length && !!from_url) {
      await health_worker_organization_calenders.markAvailabilitySet(
        ctx.state.trx,
        {
          health_worker_id: health_worker.id,
          organization_id: organization.id,
        },
      )
      return redirect('/app')
    }

    events.items.forEach((item) => {
      assertAllJohannesburg([item.start.dateTime, item.end.dateTime])
      assert(Array.isArray(item.recurrence))
      assertEquals(item.recurrence.length, 1)
      assert(item.recurrence[0].startsWith('RRULE:FREQ=WEEKLY;BYDAY='))
      const day_str = item.recurrence[0].replace('RRULE:FREQ=WEEKLY;BYDAY=', '')
      assert(day_str in short_to_long)

      const weekday = short_to_long[day_str as keyof typeof short_to_long]

      availability[weekday].push({
        start: convertToTime(item.start.dateTime),
        end: convertToTime(item.end.dateTime),
      })
    })

    return <SetAvailabilityForm availability={availability} />
  },
)
