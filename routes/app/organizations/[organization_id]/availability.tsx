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
  assertAllHarare,
  convertToTime,
  formatHarare,
} from '../../../../util/date.ts'
import { padTime } from '../../../../util/pad.ts'
import redirect from '../../../../util/redirect.ts'
import { parseDateTime } from '../../../../util/date.ts'
import {
  addCalendars,
  markAvailabilitySet,
} from '../../../../db/models/providers.ts'
import { ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs } from '../../../logged-in.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { forEach } from '../../../../util/inParallel.ts'
import { postHandler } from '../../../../util/postHandler.ts'
import z from 'zod'
import { promiseProps } from '../../../../util/promiseProps.ts'
import { OrganizationContext } from './_middleware.ts'

const days: Array<DayOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const shortToLong = {
  SU: 'Sunday' as const,
  MO: 'Monday' as const,
  TU: 'Tuesday' as const,
  WE: 'Wednesday' as const,
  TH: 'Thursday' as const,
  FR: 'Friday' as const,
  SA: 'Saturday' as const,
}

const toHarare = (time: Time) => {
  const baseHour = time.hour % 12
  const hour = time.amPm === 'am' ? baseHour : baseHour + 12
  const hourStr = padTime(hour)
  const minuteStr = padTime(time.minute)
  return `${hourStr}:${minuteStr}:00+02:00`
}

function* availabilityBlocks(
  availability: Partial<AvailabilityJSON>,
): Generator<DeepPartial<GCalEvent>> {
  const today = parseDateTime(new Date(), 'twoDigit')
  const todayIndex = days.indexOf(today.weekday as DayOfWeek)
  for (const day of days) {
    const dayAvailability = availability[day]
    if (!dayAvailability) continue
    const dayIndex = days.indexOf(day)
    const dayOffset = dayIndex - todayIndex
    const dayDate = new Date(
      Date.UTC(
        parseInt(today.year),
        parseInt(today.month) - 1,
        parseInt(today.day),
      ),
    )
    dayDate.setDate(dayDate.getDate() + dayOffset)
    const dayStr = formatHarare(dayDate).split('T')[0]

    for (const timeWindow of dayAvailability) {
      const start = toHarare(timeWindow.start)
      const end = toHarare(timeWindow.end)

      yield {
        summary: 'Availability Block',
        start: {
          dateTime: `${dayStr}T${start}`,
          timeZone: 'Africa/Johannesburg',
        },
        end: { dateTime: `${dayStr}T${end}`, timeZone: 'Africa/Johannesburg' },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${day.slice(0, 2).toUpperCase()}`,
        ],
      }
    }
  }
}

const TimeSchema = z.object({
  hour: z.number().int().min(1).max(12),
  minute: z.number().int().min(0).max(55).optional().default(0),
  amPm: z.enum(['am', 'pm']),
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
  let gcal_availability_calendar_id =
    ctx.state.organization_employment.gcal_availability_calendar_id

  const googleClient = HealthWorkerGoogleClient.fromCtx(ctx)

  if (!gcal_availability_calendar_id) {
    const [calendars] =
      await ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs(
        ctx.state.trx,
        googleClient,
        [ctx.state.organization.id],
      )
    await addCalendars(ctx.state.trx, ctx.state.healthWorker.id, [calendars])
    gcal_availability_calendar_id = calendars.gcal_availability_calendar_id
  }

  const existingAvailability = await googleClient.getActiveEvents(
    gcal_availability_calendar_id,
  )

  const existingAvailabilityEvents = existingAvailability.items || []

  // Google rate limits you if you try to do these in parallel :(
  // TODO: revisit whether to clear all these out
  await forEach(
    existingAvailabilityEvents,
    (event) =>
      googleClient.deleteEvent(gcal_availability_calendar_id, event.id),
  )

  await forEach(
    availabilityBlocks(availability),
    (event) => googleClient.insertEvent(gcal_availability_calendar_id, event),
  )
}

export const handler = postHandler(
  AvailabilitySchema,
  async (_req, ctx: OrganizationContext, form_values) => {
    const { healthWorker, trx, organization } = ctx.state
    const from_url = !!ctx.url.searchParams.get('from_url')

    await promiseProps({
      marking_availability_set: markAvailabilitySet(
        trx,
        {
          health_worker_id: healthWorker.id,
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
    _req: Request,
    ctx: OrganizationContext,
  ) {
    const { healthWorker, organization, organization_employment } = ctx.state
    const from_url = ctx.url.searchParams.get('from_url')

    const { gcal_availability_calendar_id } = organization_employment

    const googleClient = HealthWorkerGoogleClient.fromCtx(ctx)
    const events = gcal_availability_calendar_id
      ? await googleClient.getActiveEvents(
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
      await markAvailabilitySet(
        ctx.state.trx,
        {
          health_worker_id: healthWorker.id,
          organization_id: organization.id,
        },
      )
      return redirect('/app')
    }

    events.items.forEach((item) => {
      assertAllHarare([item.start.dateTime, item.end.dateTime])
      assert(Array.isArray(item.recurrence))
      assertEquals(item.recurrence.length, 1)
      assert(item.recurrence[0].startsWith('RRULE:FREQ=WEEKLY;BYDAY='))
      const dayStr = item.recurrence[0].replace('RRULE:FREQ=WEEKLY;BYDAY=', '')
      assert(dayStr in shortToLong)

      const weekday = shortToLong[dayStr as keyof typeof shortToLong]

      availability[weekday].push({
        start: convertToTime(item.start.dateTime),
        end: convertToTime(item.end.dateTime),
      })
    })

    return <SetAvailabilityForm availability={availability} />
  },
)
