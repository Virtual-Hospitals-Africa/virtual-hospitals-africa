import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  Duration,
  MonthNum,
  ParsedDate,
  ParsedDateTime,
  Time,
} from '../types.ts'
import isDate from './isDate.ts'
import isString from './isString.ts'

export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function prettyPatientDateOfBirth(
  date_of_birth: string,
): string {
  const [y, m, d] = date_of_birth.split('-').map((d) => parseInt(d, 10))
  const year = `${y}`
  const month = `${m}`.padStart(2, '0')
  const day = `${d}`.padStart(2, '0')
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  const dtDateOnly = new Date(
    date.valueOf() + date.getTimezoneOffset() * 60 * 1000,
  )
  return dtDateOnly.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function newDate(): Date {
  return new Date()
}

export const formats = {
  numeric: new Intl.DateTimeFormat('en-gb', {
    weekday: 'long',
    month: 'numeric',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }),
  twoDigit: new Intl.DateTimeFormat('en-gb', {
    weekday: 'long',
    month: '2-digit',
    year: 'numeric',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Johannesburg',
  }),
  justDate: new Intl.DateTimeFormat('en-gb', {
    month: '2-digit',
    year: 'numeric',
    day: '2-digit',
    timeZone: 'Africa/Johannesburg',
  }),
}

export function parseDateTime(
  date: string | Date,
  format: 'numeric' | 'twoDigit',
): ParsedDateTime {
  const formatter = formats[format]
  const dateString = formatter.format(new Date(date))
  const [weekday, dateParts, timeParts] = dateString.split(', ')
  const [day, month, year] = dateParts.split('/')
  const [hour, minute, second] = timeParts.split(':')
  return { weekday, day, month, year, hour, minute, second, format }
}

export function parseDate(
  date: string | Date,
): ParsedDate {
  const dateString = formats.justDate.format(new Date(date))
  const [day, month, year] = dateString.split('/')
  return { day, month, year }
}

export function stringify(date: ParsedDateTime | Date): string {
  if (isDate(date)) date = parseDateTime(date, 'numeric')
  assert(date.format === 'numeric')
  const { day, month, year, hour, minute, second } = date
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+02:00`
}

export function stringifyJustDate(
  date: ParsedDateTime | ParsedDate | Date | string,
): string {
  if (isDate(date) || isString(date)) date = parseDate(date)
  const { day, month, year } = date
  return `${year}-${month}-${day}`
}

export function todayISOInHarare() {
  const { day, month, year } = parseDateTime(new Date(), 'twoDigit')
  return `${year}-${month}-${day}`
}

export function tomorrowISOInHarare() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const { day, month, year } = parseDateTime(date, 'twoDigit')
  return `${year}-${month}-${day}`
}

export function formatHarare(
  date: Date | string = new Date(),
): string {
  const { day, month, year, hour, minute, second } = parseDateTime(
    date,
    'twoDigit',
  )
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+02:00`
}

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const rfc3339Regex =
  /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/

export function differenceInDays(date1: string, date2: string): number {
  date1 = date1.slice(0, 10)
  date2 = date2.slice(0, 10)
  assert(dateRegex.test(date1), `Expected ISO format: ${date1}`)
  assert(dateRegex.test(date2), `Expected ISO format: ${date2}`)

  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24

  // Calculating the time difference between two dates
  const diffInTime = new Date(date1).getTime() - new Date(date2).getTime()

  // Calculating the no. of days between two dates
  return Math.round(diffInTime / oneDay)
}

export function differenceInMinutes(date1: Date, date2: Date): number {
  return (date1.valueOf() - date2.valueOf()) / 60000
}

const longDayFormat = new Intl.DateTimeFormat('en-gb', {
  month: 'long',
  day: 'numeric',
  timeZone: 'Africa/Johannesburg',
})

const timeFormat = new Intl.DateTimeFormat('en-gb', {
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'Africa/Johannesburg',
})

// TODO: revisit this function. We should also print the day for today and tomorrow
export function prettyAppointmentTime(startTime: string | Date): string {
  if (isString(startTime)) {
    assert(
      rfc3339Regex.test(startTime),
      `Expected RFC3339 format: ${startTime}`,
    )
    assert(
      startTime.endsWith('+02:00'),
      `Expected ${startTime} to be in Harare time`,
    )
  } else {
    assert(isDate(startTime))
  }

  const start = isString(startTime) ? new Date(startTime) : startTime

  const now = formatHarare()
  const diff = differenceInDays(formatHarare(start), now)

  assert(diff >= 0, 'First available appointment is in the past')

  let dateStr: string
  if (diff === 0) {
    dateStr = 'Today'
  } else if (diff === 1) {
    dateStr = 'Tomorrow'
  } else {
    dateStr = longDayFormat.format(start)
  }

  const prettyTime = timeFormat.format(start)

  return `${dateStr} at ${prettyTime}`
}

export function timeInSimpleAmPm(parsed: ParsedDateTime): string {
  const hour = parseInt(parsed.hour)

  if (hour === 0) return `12:${parsed.minute}am`
  if (hour === 12) return `12:${parsed.minute}pm`
  return hour > 12
    ? `${hour - 12}:${parsed.minute}pm`
    : `${hour}:${parsed.minute}am`
}

export function timeRangeInSimpleAmPm(
  start: ParsedDateTime,
  end: ParsedDateTime,
): string {
  const timeStart = timeInSimpleAmPm(start)
  const timeEnd = timeInSimpleAmPm(end)
  const sameAmPm = timeStart.slice(-2) === timeEnd.slice(-2)
  return sameAmPm
    ? `${timeStart.slice(0, -2)}-${timeEnd}`
    : `${timeStart}-${timeEnd}`
}

export function isRfc3339(date: string): boolean {
  return rfc3339Regex.test(date)
}

export function isIsoHarare(date: string): boolean {
  return isRfc3339(date) && date.endsWith('+02:00')
}

export function assertAllHarare(dates: string[]) {
  for (const date of dates) {
    assert(
      isIsoHarare(date),
      `Expected ${date} to be in Harare time`,
    )
  }
}

const isLeap = (year: number): boolean =>
  (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0)

export function monthName(month: MonthNum): string {
  switch (month) {
    case 1:
      return 'January'
    case 2:
      return 'February'
    case 3:
      return 'March'
    case 4:
      return 'April'
    case 5:
      return 'May'
    case 6:
      return 'June'
    case 7:
      return 'July'
    case 8:
      return 'August'
    case 9:
      return 'September'
    case 10:
      return 'October'
    case 11:
      return 'November'
    case 12:
      return 'December'
    default:
      throw new Error(`Invalid month (${month})`)
  }
}

export function numberOfDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 1:
      return 31
    case 2:
      return isLeap(year) ? 29 : 28
    case 3:
      return 31
    case 4:
      return 30
    case 5:
      return 31
    case 6:
      return 30
    case 7:
      return 31
    case 8:
      return 31
    case 9:
      return 30
    case 10:
      return 31
    case 11:
      return 30
    case 12:
      return 31
    default:
      throw new Error(`Invalid month (${month})`)
  }
}

export function convertToTime(date: string): Time {
  const [, timeAndZone] = date.split('T')
  const [time] = timeAndZone.split('+')
  const [hourStr, minuteStr, second] = time.split(':')
  assertEquals(second, '00')
  const hour = parseInt(hourStr)
  const minute = parseInt(minuteStr)
  assertEquals(minute % 5, 0)
  const amPm = hour >= 12 ? 'pm' : 'am'
  const hourMod = hour % 12
  return {
    hour: hourMod === 0 ? 12 : hourMod as Time['hour'],
    minute: minute as Time['minute'],
    amPm,
  }
}

export function convertToTimeString(time: string): string {
  const formattedTime = convertToTime(time)
  const minute = formattedTime.minute
    ? formattedTime.minute.toString().padStart(2, '0')
    : '00'
  return `${formattedTime.hour}:${minute} ${formattedTime.amPm}`
}

export function isValidDate(messageBody: string): boolean {
  const [d, m, y] = messageBody.split('/')
  const year = `${y}`
  const month = `${m}`.padStart(2, '0')
  const day = `${d}`.padStart(2, '0')
  const date = new Date(
    `${year}-${month}-${day}T00:00:00Z`,
  )
  return date.toDateString() !== 'Invalid Date'
}

export function getISOInHarare(date: Date) {
  const { day, month, year } = parseDateTime(date, 'twoDigit')
  return `${year}-${month}-${day}`
}

export function prettyMinimal(day: string, today: string) {
  const [year, month, date] = day.split('-')
  const dayDate = new Date(`${year}-${month}-${date}T00:00:00Z`)
  const dayInHarare = getISOInHarare(dayDate)
  const todayInHarare = getISOInHarare(new Date(today))
  const diff = differenceInDays(dayInHarare, todayInHarare)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  const monthStr = monthName(parseInt(month) as MonthNum)
  const sameYearAsToday = year === today.split('-')[0]
  return sameYearAsToday
    ? `${parseInt(date)} ${monthStr}`
    : `${parseInt(date)} ${monthStr} ${year}`
}

export function durationEndDate(
  start_date: Date | string,
  duration: Duration,
): null | string {
  if (duration.duration_unit === 'indefinitely') return null
  const start = new Date(start_date)
  const end = new Date(start)
  switch (duration.duration_unit) {
    case 'days':
      end.setDate(start.getDate() + duration.duration)
      break
    case 'weeks':
      end.setDate(start.getDate() + duration.duration * 7)
      break
    case 'months':
      end.setMonth(start.getMonth() + duration.duration)
      break
    case 'years':
      end.setFullYear(start.getFullYear() + duration.duration)
      break
    default:
      throw new Error(`Invalid duration unit: ${duration.duration_unit}`)
  }
  return stringifyJustDate(end)
}

export function approximateDuration(
  start_date: string,
  end_date: string,
): Duration & { approximate: true } {
  const duration_in_days = durationBetween(start_date, end_date)
  assertEquals(duration_in_days.duration_unit, 'days')
  if (duration_in_days.duration <= 14) {
    return { ...duration_in_days, approximate: true }
  }
  if (duration_in_days.duration <= 60) {
    return {
      duration: Math.round(duration_in_days.duration / 7),
      duration_unit: 'weeks',
      approximate: true,
    }
  }
  if (duration_in_days.duration <= 730) {
    return {
      duration: Math.round(duration_in_days.duration / 30),
      duration_unit: 'months',
      approximate: true,
    }
  }
  return {
    duration: Math.round(duration_in_days.duration / 365),
    duration_unit: 'years',
    approximate: true,
  }
}

export function durationBetween(
  start_date: Date | string,
  end_date: Date | string,
): Duration {
  const start = new Date(start_date)
  const end = new Date(end_date)
  const duration = end.valueOf() - start.valueOf()
  const days = duration / (1000 * 60 * 60 * 24)
  if (days % 1 !== 0) throw new Error('Duration is not a whole number of days')
  return {
    duration: days,
    duration_unit: 'days',
  }
}

export function isISODateString(date: unknown): date is string {
  return isString(date) && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    (new Date(date).toDateString() !== 'Invalid Date')
}

export function isISODateTimeString(datetime: unknown): datetime is string {
  return isString(datetime) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(datetime) &&
    (new Date(datetime).toDateString() !== 'Invalid Date')
}
