import * as google from '../../external-clients/google.ts'
import { getAllWithExtantTokens } from '../../db/models/health_workers.ts'
import {
  Availability,
  GCalFreeBusy,
  HealthWorkerWithGoogleTokens,
  ReturnedSqlRow,
  TimeRange,
  TrxOrDb,
} from '../../types.ts'
import { assertAllHarare, formatHarare } from '../../util/date.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import flatten from '../../util/flatten.ts'

export function getAvailability(
  health_worker: {
    gcal_availability_calendar_id: string
    gcal_appointments_calendar_id: string
  },
  freeBusy: GCalFreeBusy,
): Availability {
  const availability = [
    ...freeBusy.calendars[health_worker.gcal_availability_calendar_id].busy,
  ]

  const appointments =
    freeBusy.calendars[health_worker.gcal_appointments_calendar_id].busy

  appointments.forEach((appointment) => {
    const conflictIndex = availability.findIndex((availabilityBlock) =>
      (
        appointment.start >= availabilityBlock.start &&
        appointment.start < availabilityBlock.end
      ) || (
        appointment.end > availabilityBlock.start &&
        appointment.end <= availabilityBlock.end
      )
    )

    if (conflictIndex === -1) return

    const conflict = availability[conflictIndex]

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

    availability.splice(conflictIndex, 1, ...spliceWith)
  })

  return availability
}

// By default, leave health_worker 2 hours to be able to confirm the appointment
// and look for appointments within the next week
export function defaultTimeRange(): TimeRange {
  const timeMin = new Date()
  timeMin.setHours(timeMin.getHours() + 2)
  const timeMax = new Date(timeMin)
  timeMax.setDate(timeMin.getDate() + 7)
  return { timeMin, timeMax }
}
export async function getHealthWorkerAvailability(
  health_worker: HealthWorkerWithGoogleTokens,
  timeRange = defaultTimeRange(),
) {
  const healthWorkerGoogleClient = new google.GoogleClient(health_worker)
  const freeBusy = await healthWorkerGoogleClient.getFreeBusy({
    ...timeRange,
    calendarIds: [
      health_worker.gcal_appointments_calendar_id,
      health_worker.gcal_availability_calendar_id,
    ],
  })
  return {
    health_worker,
    availability: getAvailability(health_worker, freeBusy),
  }
}

export function getAllHealthWorkerAvailability(
  health_workers: ReturnedSqlRow<HealthWorkerWithGoogleTokens>[],
  timeRange: TimeRange = defaultTimeRange(),
) {
  return Promise.all(
    health_workers.map((health_worker) =>
      getHealthWorkerAvailability(health_worker, timeRange)
    ),
  )
}

/**
 * Gets health_worker availability slots from google calendar, returned as 30 minutes blocks.
 * Filter out any previously declined times
 */
export async function availableSlots(
  trx: TrxOrDb,
  { dates, declinedTimes = [], count, health_workers, durationMinutes = 30 }: {
    count: number
    declinedTimes?: string[]
    dates?: string[]
    health_workers?: ReturnedSqlRow<HealthWorkerWithGoogleTokens>[]
    durationMinutes?: number
  },
): Promise<{
  health_worker: ReturnedSqlRow<HealthWorkerWithGoogleTokens>
  start: Date
  end: Date
  durationMinutes: number
}[]> {
  assert(count > 0, 'count must be greater than 0')
  assertAllHarare(declinedTimes)

  const healthWorkerAvailability = await getAllHealthWorkerAvailability(
    health_workers || await getAllWithExtantTokens(trx),
  )

  const slots: {
    health_worker: HealthWorkerWithGoogleTokens
    start: string
    end: string
    durationMinutes: number
  }[] = []
  for (const { health_worker, availability } of healthWorkerAvailability) {
    for (const { start, end } of availability) {
      const moreSlots = generateSlots({ start, end, durationMinutes })
        .filter((slot) => !declinedTimes.includes(slot.start))
        .filter((appointment) => {
          if (!dates) return true
          const appointment_date = appointment.start.substring(0, 10)
          return dates.includes(appointment_date)
        })
        .map((slot) => ({
          health_worker,
          ...slot,
        }))

      slots.push(...moreSlots)
    }
  }
  slots.sort((a, b) =>
    new Date(a.start).valueOf() - new Date(b.start).valueOf()
  )

  if (!slots.length) return []

  const uniqueSlots = [
    ...new Map(slots.map((slot) => [slot.start, slot]))
      .values(),
  ]

  assert(uniqueSlots.length > 0, 'No availability found')

  const slotsWithDates = uniqueSlots.map((slot) => ({
    health_worker: slot.health_worker,
    start: new Date(slot.start),
    end: new Date(slot.end),
    durationMinutes: slot.durationMinutes,
  }))

  if (!dates) return slotsWithDates.slice(0, count)

  assertEquals(
    count / dates.length,
    Math.floor(count / dates.length),
    'For now we only support balancing slots across dates evenly',
  )

  return flatten(dates.map((date) =>
    slotsWithDates.filter(
      (time) => formatHarare(time.start).startsWith(date),
    ).slice(0, count / dates.length)
  ))
}

function generateSlots(
  { start, end, durationMinutes = 30 }: {
    start: string
    end: string
    durationMinutes?: number
  },
): { start: string; end: string; durationMinutes: number }[] {
  const durationMillis = durationMinutes * 60 * 1000
  const current = new Date(start)
  current.setMinutes(
    Math.ceil(current.getMinutes() / durationMinutes) * durationMinutes,
  ) // 0 or 30
  current.setSeconds(0)
  current.setMilliseconds(0)

  const endTime = new Date(end).getTime()

  const slots: { start: string; end: string; durationMinutes: number }[] = []
  while (current.getTime() + durationMillis <= endTime) {
    const startDate = formatHarare(current)
    current.setTime(current.getTime() + durationMillis)
    const endDate = formatHarare(current)
    slots.push({ start: startDate, end: endDate, durationMinutes })
  }
  return slots
}
