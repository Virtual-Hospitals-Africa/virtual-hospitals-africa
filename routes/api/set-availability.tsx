import { DoctorGoogleClient } from '../../external-clients/google.ts'
import set from '../../util/set.ts'
import {
  AvailabilityJSON,
  DayOfWeek,
  DeepPartial,
  GCalEvent,
  LoggedInDoctorHandler,
  Time,
} from '../../types.ts'
import padLeft from '../../util/padLeft.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/_util/asserts.ts'
import { parseDate } from '../../util/date.ts'

const days: Array<DayOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function parseForm(params: URLSearchParams): AvailabilityJSON {
  console.log(params)
  const availability = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }

  params.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value) ? parseInt(value) : value
    set(availability, key, toSet)
  })

  console.log(availability)
  return availability
}

const toHarare = (time: Time) => {
  const baseHour = time.hour % 12
  const hour = time.amPm === 'am' ? baseHour : baseHour + 12
  const hourStr = padLeft(String(hour), 2, '0')
  const minuteStr = padLeft(String(time.minute), 2, '0')
  return `${hourStr}:${minuteStr}:00+02:00`
}

function* availabilityBlocks(
  availability: AvailabilityJSON,
): Generator<DeepPartial<GCalEvent>> {
  const today = parseDate(new Date(), 'twoDigit')
  const todayIndex = days.indexOf(today.weekday as DayOfWeek)
  for (const day of days) {
    const dayAvailability = availability[day]
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
    const dayStr = dayDate.toISOString().split('T')[0]

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

export const handler: LoggedInDoctorHandler = {
  async POST(req, ctx) {
    const params = new URLSearchParams(await req.text())
    const availability = parseForm(params)

    const gcal_availability_calendar_id = ctx.state.session.get(
      'gcal_availability_calendar_id',
    )

    assert(gcal_availability_calendar_id, 'No calendar ID found in session')

    const googleClient = new DoctorGoogleClient(ctx)

    const existingAvailability = await googleClient.getEvents(
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

    // TODO: Redirect to calendar
    return redirect('/app/calendar?availability-set=true')
  },
}
