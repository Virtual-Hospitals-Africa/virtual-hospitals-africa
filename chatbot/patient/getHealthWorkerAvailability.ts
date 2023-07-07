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

// Leave health_worker 2 hours to be able to confirm the appointment
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

async function getAllAvailability(
  trx: TrxOrDb,
  timeRange: TimeRange = defaultTimeRange(),
) {
  const health_workers = await getAllWithExtantTokens(trx)
  return Promise.all(health_workers.map(async (health_worker) => {
    const healthWorkerGoogleClient = new google.GoogleClient(health_worker)
    const freeBusy = await healthWorkerGoogleClient.getFreeBusy({
      ...timeRange,
      calendarIds: [
        health_worker.gcal_appointments_calendar_id,
        health_worker.gcal_availability_calendar_id,
      ],
    })
    return getAvailability(health_worker, freeBusy)
  }))
}

export async function getAllHealthWorkerAvailability(
  trx: TrxOrDb,
  timeRange: TimeRange = defaultTimeRange(),
) {
  const health_workers = await getAllWithExtantTokens(trx)
  return Promise.all(
    health_workers.map((health_worker) =>
      getHealthWorkerAvailability(health_worker, timeRange)
    ),
  )
}

/**
 * Gets health_worker availability from google calendar, spilt them into 30 minutes block, and filter out
 * the declined time and return an object containing the start time and health_worker.
 * @param trx db transaction object
 * @param declinedTimes a string array that contains the declined time slot
 * @param opts date: specify a date to see appointments on that date
 * @returns an object containing the start time and health_worker
 */

export async function availableThirtyMinutes(
  trx: TrxOrDb,
  { dates, declinedTimes = [], timeslotsRequired }: { 
    timeslotsRequired: number
    declinedTimes?: string[]
    dates?: string[]
  },
): Promise<{
  health_worker: ReturnedSqlRow<HealthWorkerWithGoogleTokens>
  start: string
}[]> {
  assertAllHarare(declinedTimes)
  const healthWorkerAvailability = await getAllHealthWorkerAvailability(trx)

  let appointments: {
    health_worker: HealthWorkerWithGoogleTokens
    start: string
  }[]
  appointments = []
  for (const { health_worker, availability } of healthWorkerAvailability) {
    for (const { start, end } of availability) {
      const health_worker_appointments = generateAvailableThrityMinutes(
        start,
        end,
      )
        .filter((time) => !declinedTimes.includes(time))
        .filter((appointment) => {
          if (!opts.dates) return true
          const appointment_date = appointment.substring(0, 10)
          return opts.dates.includes(appointment_date)
        })
        .map((start) => ({
          health_worker,
          start,
        }))
      appointments = appointments.concat(health_worker_appointments)
    }
  }
  appointments.sort((a, b) =>
    new Date(a.start).valueOf() - new Date(b.start).valueOf()
  )
  const uniqueAppointmentTimeslots = [
    ...new Map(appointments.map((timeBlock) => [timeBlock.start, timeBlock]))
      .values(),
  ]

  if (uniqueAppointmentTimeslots.length === 0) {
    throw new Error('No availability found')
  }

  const requiredTimeslots: {
    health_worker: ReturnedSqlRow<HealthWorkerWithGoogleTokens>
    start: string
  }[] = []
  if (dates) {
    dates.forEach((requiredDate) => {
      const appointmentOnASpecificDate = uniqueAppointmentTimeslots.filter(
        (time) => time.start.startsWith(requiredDate),
      )
      const slicedAppointmentOnASpecificDate =
        appointmentOnASpecificDate.length > timeslotsRequired
          ? appointmentOnASpecificDate.slice(0, timeslotsRequired)
          : appointmentOnASpecificDate
      slicedAppointmentOnASpecificDate.forEach((appointment) =>
        requiredTimeslots.push(appointment)
      )
    })
  } else {
    return uniqueAppointmentTimeslots.length > timeslotsRequired
      ? uniqueAppointmentTimeslots.slice(0, timeslotsRequired)
      : uniqueAppointmentTimeslots
  }

  return requiredTimeslots
}

function generateAvailableThrityMinutes(start: string, end: string): string[] {
  const appointments = []
  const appointmentDuration = 30 * 60 * 1000 // duration of each appointment in milliseconds
  const current = new Date(start)
  current.setMinutes(Math.ceil(current.getMinutes() / 30) * 30) // 0 or 30
  current.setSeconds(0)
  current.setMilliseconds(0)

  while (current.getTime() + appointmentDuration <= new Date(end).getTime()) {
    const currentDate = formatHarare(current)
    appointments.push(currentDate)
    current.setTime(current.getTime() + appointmentDuration)
  }
  return appointments
}
