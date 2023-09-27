import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  AvailabilityJSON,
  DayOfWeek,
  DeepPartial,
  GCalEvent,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Time,
} from '../../../types.ts'
import SetAvailabilityForm from '../../../islands/availability-form.tsx'
import { HealthWorkerGoogleClient } from '../../../external-clients/google.ts'
import {
  assertAllHarare,
  convertToTime,
  formatHarare,
} from '../../../util/date.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import { padTime } from '../../../util/pad.ts'
import redirect from '../../../util/redirect.ts'
import { parseDate } from '../../../util/date.ts'
import { Container } from '../../../components/library/Container.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import { isPartialAvailability } from '../../../scheduling/availability.tsx'

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
  const today = parseDate(new Date(), 'twoDigit')
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

export const handler: LoggedInHealthWorkerHandler<
  { availability: AvailabilityJSON; healthWorker: HealthWorker }
> = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const googleClient = new HealthWorkerGoogleClient(ctx)
    const events = await googleClient.getActiveEvents(
      ctx.state.session.data.gcal_availability_calendar_id,
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
    const availability = await parseRequest(
      ctx.state.trx,
      req,
      isPartialAvailability,
    )

    const gcal_availability_calendar_id = ctx.state.session.get(
      'gcal_availability_calendar_id',
    )

    assert(gcal_availability_calendar_id, 'No calendar ID found in session')

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

    return redirect('/app/calendar?availability-set=true')
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
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        <SetAvailabilityForm availability={props.data.availability} />
      </Container>
    </Layout>
  )
}
