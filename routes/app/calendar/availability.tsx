import { PageProps } from '$fresh/server.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  AvailabilityJSON,
  DayOfWeek,
  DeepPartial,
  GCalEvent,
  HealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Time,
} from '../../../types.ts'
import SetAvailabilityForm from '../../../islands/availability-form.tsx'
import { HealthWorkerGoogleClient } from '../../../external-clients/google.ts'
import {
  assertAllHarare,
  convertToTime,
  formatHarare,
} from '../../../util/date.ts'
import { padTime } from '../../../util/pad.ts'
import redirect from '../../../util/redirect.ts'
import { parseDateTime } from '../../../util/date.ts'
import { parseRequestAsserts } from '../../../util/parseForm.ts'
import { assertIsPartialAvailability } from '../../../shared/scheduling/availability.tsx'
import { getNumericParam } from '../../../util/getNumericParam.ts'
import { assertOr403 } from '../../../util/assertOr.ts'
import hrefFromCtx from '../../../util/hrefFromCtx.ts'
import { markAvailabilitySet } from '../../../db/models/providers.ts'
import { HomePageSidebar } from '../../../components/library/Sidebar.tsx'

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

export const handler: LoggedInHealthWorkerHandlerWithProps<
  { availability: AvailabilityJSON; healthWorker: HealthWorker }
> = {
  async GET(_req, ctx) {
    const { healthWorker } = ctx.state

    const organization_id_param =
      parseInt(ctx.url.searchParams.get('organization_id')!) || null

    if (healthWorker.employment.length > 1 && !organization_id_param) {
      return redirect(hrefFromCtx(ctx, (url) => {
        url.searchParams.set(
          'organization_id',
          String(healthWorker.default_organization_id),
        )
      }))
    }

    const organization_id = organization_id_param ||
      healthWorker.default_organization_id
    const matching_employment = healthWorker.employment.find(
      (employment) => employment.organization.id === organization_id,
    )
    assertOr403(
      matching_employment,
      'Health worker not employed at this organization',
    )
    const gcal_availability_calendar_id =
      matching_employment!.gcal_availability_calendar_id

    const googleClient = new HealthWorkerGoogleClient(ctx)
    const events = await googleClient.getActiveEvents(
      gcal_availability_calendar_id,
    )

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
    if (events.items.length && !!ctx.url.searchParams.get('initial')) {
      await markAvailabilitySet(
        ctx.state.trx,
        {
          health_worker_id: healthWorker.id,
          organization_id,
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

    return ctx.render({ availability, healthWorker })
  },
  async POST(req, ctx) {
    const { healthWorker } = ctx.state
    const availability = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsPartialAvailability,
    )

    const initial = !!ctx.url.searchParams.get('initial')
    const organization_id_param = getNumericParam(ctx, 'organization_id')

    const organization_id = organization_id_param ||
      healthWorker.employment[0].organization.id
    const matching_employment = healthWorker.employment.find(
      (employment) => employment.organization.id === organization_id,
    )
    assertOr403(
      matching_employment,
      'Health worker not employed at this organization',
    )

    const marking_availability_set = markAvailabilitySet(
      ctx.state.trx,
      {
        health_worker_id: healthWorker.id,
        organization_id,
      },
    )

    const gcal_availability_calendar_id =
      matching_employment!.gcal_availability_calendar_id

    const googleClient = new HealthWorkerGoogleClient(ctx)

    const existingAvailability = await googleClient.getActiveEvents(
      gcal_availability_calendar_id,
    )

    const existingAvailabilityEvents = existingAvailability.items || []

    // Google rate limits you if you try to do these in parallel :(
    // TODO: revisit whether to clear all these out
    for (const event of existingAvailabilityEvents) {
      await googleClient.deleteEvent(gcal_availability_calendar_id, event.id)
    }
    for (const event of availabilityBlocks(availability)) {
      await googleClient.insertEvent(gcal_availability_calendar_id, event)
    }

    await marking_availability_set
    const success = encodeURIComponent(
      'Thanks! With your availability updated your coworkers can now book appointments with you and know when you are available 📆',
    )
    const next_page = initial ? '/app' : '/app/calendar'
    return redirect(`${next_page}?success=${success}`)
  },
}

export default function SetAvailability(
  props: PageProps<
    { availability: AvailabilityJSON; healthWorker: HealthWorker }
  >,
) {
  return (
    <Layout
      title='Set Availability'
      url={props.url}
      variant='form'
      sidebar={
        <HomePageSidebar
          route={props.route}
          urlSearchParams={props.url.searchParams}
          params={{}}
        />
      }
    >
      <SetAvailabilityForm availability={props.data.availability} />
    </Layout>
  )
}
