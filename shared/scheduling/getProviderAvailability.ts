import * as google from '../../external-clients/google.ts'
import { getMany } from '../../db/models/providers.ts'
import {
  Availability,
  GCalFreeBusy,
  Provider,
  TimeRange,
  TrxOrDb,
} from '../../types.ts'
import { assertAllJohannesburg, formatJohannesburg } from '../../util/date.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import flatten from '../../util/flatten.ts'

export function getAvailability(
  provider: {
    gcal_availability_calendar_id: string
    gcal_appointments_calendar_id: string
  },
  free_busy: GCalFreeBusy,
): Availability {
  const availability = [
    ...free_busy.calendars[provider.gcal_availability_calendar_id].busy,
  ]

  const appointments =
    free_busy.calendars[provider.gcal_appointments_calendar_id].busy

  appointments.forEach((appointment) => {
    const conflict_index = availability.findIndex((availabilityBlock) =>
      (
        appointment.start >= availabilityBlock.start &&
        appointment.start < availabilityBlock.end
      ) || (
        appointment.end > availabilityBlock.start &&
        appointment.end <= availabilityBlock.end
      )
    )

    if (conflict_index === -1) return

    const conflict = availability[conflict_index]

    let spliceWith: Availability

    if (
      conflict.start === appointment.start && conflict.end === appointment.end
    ) {
      spliceWith = []
    } else if (conflict.start === appointment.start) {
      spliceWith = [{
        start: appointment.end,
        end: conflict.end,
      }]
    } else if (conflict.end === appointment.end) {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start,
      }]
      return
    } else {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start,
      }, {
        start: appointment.end,
        end: conflict.end,
      }]
    }

    availability.splice(conflict_index, 1, ...spliceWith)
  })

  return availability
}

// By default, leave provider 2 hours to be able to confirm the appointment
// and look for appointments within the next week
export function defaultTimeRange(): TimeRange {
  const time_min = new Date()
  time_min.setHours(time_min.getHours() + 2)
  const time_max = new Date(time_min)
  time_max.setDate(time_min.getDate() + 7)
  return { time_min, time_max }
}

export async function providerAvailability(
  trx: TrxOrDb,
  provider: Provider,
  timeRange = defaultTimeRange(),
) {
  const health_worker_google_client = new google.HealthWorkerGoogleClient(trx, {
    ...provider,
    id: provider.health_worker_id,
  })
  console.log(
    'health_worker_google_client.getFreeBusy',
    health_worker_google_client.getFreeBusy,
  )
  const free_busy = await health_worker_google_client.getFreeBusy({
    ...timeRange,
    calendarIds: [
      provider.gcal_appointments_calendar_id,
      provider.gcal_availability_calendar_id,
    ],
  })
  return {
    provider,
    availability: getAvailability(provider, free_busy),
  }
}

export function getAllProviderAvailability(
  trx: TrxOrDb,
  providers: Provider[],
  timeRange: TimeRange = defaultTimeRange(),
) {
  return Promise.all(
    providers.map((provider) => providerAvailability(trx, provider, timeRange)),
  )
}

/**
 * Gets health_worker availability slots from google calendar, returned as 30 minutes blocks.
 * Filter out any previously declined times
 */
export async function availableSlots(
  trx: TrxOrDb,
  { dates, declined_times = [], count, employment_ids, duration_minutes = 30 }:
    {
      count: number
      declined_times?: string[]
      dates?: string[]
      employment_ids?: string[]
      duration_minutes?: number
    },
): Promise<{
  provider: Provider
  start: Date
  end: Date
  duration_minutes: number
}[]> {
  assert(count > 0, 'count must be greater than 0')
  assertAllJohannesburg(declined_times)

  const providers = await getMany(trx, { employment_ids })
  const provider_availability = await getAllProviderAvailability(trx, providers)

  const slots: {
    provider: Provider
    start: string
    end: string
    duration_minutes: number
  }[] = []
  for (const { provider, availability } of provider_availability) {
    for (const { start, end } of availability) {
      const more_slots = generateSlots({ start, end, duration_minutes })
        .filter((slot) => !declined_times.includes(slot.start))
        .filter((appointment) => {
          if (!dates) return true
          const appointment_date = appointment.start.substring(0, 10)
          return dates.includes(appointment_date)
        })
        .map((slot) => ({
          provider,
          ...slot,
        }))

      slots.push(...more_slots)
    }
  }
  slots.sort((a, b) =>
    new Date(a.start).valueOf() - new Date(b.start).valueOf()
  )

  if (!slots.length) return []

  const unique_slots = [
    ...new Map(slots.map((slot) => [slot.start, slot]))
      .values(),
  ]

  assert(unique_slots.length > 0, 'No availability found')

  const slots_with_dates = unique_slots.map((slot) => ({
    provider: slot.provider,
    start: new Date(slot.start),
    end: new Date(slot.end),
    duration_minutes: slot.duration_minutes,
  }))

  if (!dates) return slots_with_dates.slice(0, count)

  assertEquals(
    count / dates.length,
    Math.floor(count / dates.length),
    'For now we only support balancing slots across dates evenly',
  )

  return flatten(dates.map((date) =>
    slots_with_dates.filter(
      (time) => formatJohannesburg(time.start).startsWith(date),
    ).slice(0, count / dates.length)
  ))
}

function generateSlots(
  { start, end, duration_minutes = 30 }: {
    start: string
    end: string
    duration_minutes?: number
  },
): { start: string; end: string; duration_minutes: number }[] {
  const duration_millis = duration_minutes * 60 * 1000
  const current = new Date(start)
  current.setMinutes(
    Math.ceil(current.getMinutes() / duration_minutes) * duration_minutes,
  ) // 0 or 30
  current.setSeconds(0)
  current.setMilliseconds(0)

  const end_time = new Date(end).getTime()

  const slots: { start: string; end: string; duration_minutes: number }[] = []
  while (current.getTime() + duration_millis <= end_time) {
    const start_date = formatJohannesburg(current)
    current.setTime(current.getTime() + duration_millis)
    const end_date = formatJohannesburg(current)
    slots.push({ start: start_date, end: end_date, duration_minutes })
  }
  return slots
}
