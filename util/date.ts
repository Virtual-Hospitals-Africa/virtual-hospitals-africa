import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  DefiniteDuration,
  Duration,
  MonthNum,
  ParsedDate,
  ParsedDateTime,
  Time,
} from '../types.ts'
import isDate from './isDate.ts'
import isString from './isString.ts'
import isObjectLike from './isObjectLike.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { exists } from './exists.ts'
import { padMonth, padMonthDay } from './pad.ts'
import assertLength from './assertLength.ts'

export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function prettyPatientDateOfBirth(
  date_of_birth: string,
): string {
  const [y, m, d] = date_of_birth.split('-').map((d) => parseInt(d, 10))
  const year = `${y}`
  const month = `${m}`.padStart(2, '0')
  const day = `${d}`.padStart(2, '0')
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  const dt_date_only = new Date(
    date.valueOf() + date.getTimezoneOffset() * 60 * 1000,
  )
  return dt_date_only.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// export const formats = {
//   numeric: new Intl.DateTimeFormat('en-gb', {
//     weekday: 'long',
//     month: 'numeric',
//     year: 'numeric',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     timeZone: time_zone
//   }),
//   // two_digit: new Intl.DateTimeFormat('en-gb', {
//   //   weekday: 'long',
//   //   month: '2-digit',
//   //   year: 'numeric',
//   //   day: '2-digit',
//   //   hour: '2-digit',
//   //   minute: '2-digit',
//   //   second: '2-digit',
//   //   timeZone: 'Africa/Johannesburg',
//   // }),
//   just_date: new Intl.DateTimeFormat('en-gb', {
//     month: '2-digit',
//     year: 'numeric',
//     day: '2-digit',
//     timeZone: 'Africa/Johannesburg',
//   }),
// }

export function parseDateTime(
  date: string | Date,
  timezone: string = 'Africa/Johannesburg',
): ParsedDateTime {
  const date_string = new Intl.DateTimeFormat('en-gb', {
    weekday: 'long',
    month: 'numeric',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: timezone,
  }).format(new Date(date))
  const [weekday, dateParts, timeParts] = date_string.split(', ')
  const [day, month, year] = dateParts.split('/')
  const [hour, minute, second] = timeParts.split(':')
  return {
    weekday,
    day,
    month,
    year,
    hour,
    minute,
    second,
    timezone,
    format: 'numeric',
  }
}

export function parseDate(
  date: string | Date,
  timezone: string = 'Africa/Johannesburg',
): ParsedDate {
  if (typeof date === 'string') {
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(date),
      `${date} needs to be YYYY-MM-DD format`,
    )
  }
  const date_string = new Intl.DateTimeFormat('en-gb', {
    month: '2-digit',
    year: 'numeric',
    day: '2-digit',
    timeZone: timezone,
  }).format(new Date(date))

  const [day, month, year] = date_string.split('/')
  return { day, month, year, timezone }
}

function isParsedDate(date: unknown): date is ParsedDate {
  return isObjectLike(date) && 'day' in date && 'month' in date &&
    'year' in date && typeof date.day === 'string' &&
    typeof date.month === 'string' && typeof date.year === 'string' &&
    !('hour' in date)
}

function isTimezoneAdjustment(timezone: string): boolean {
  const adjustment = timezone.slice(0, 1)
  const hours = parseInt(timezone.slice(1, 3))
  const colon = timezone.slice(3, 4)
  const minutes = parseInt(timezone.slice(4, 6))
  return (
    (adjustment === '+' || adjustment === '-') &&
    (colon === ':') &&
    (hours >= 0 && hours <= 23) &&
    (minutes >= 0 && minutes <= 59)
  )
}

export function stringify(
  date: ParsedDateTime | ParsedDate | Date | string,
): string {
  if (isParsedDate(date)) {
    assert(date.year.length === 4, 'Only support four digit year')
    assertEquals(
      date.timezone,
      'Africa/Johannesburg',
      'Only Joburg supported for now',
    )
    return `${date.year}-${padMonth(date.month)}-${
      padMonthDay(date.day)
    }T00:00:00+02:00`
  }
  if (isString(date)) {
    if (date.endsWith('+02:00')) {
      return date
    }
    if (date_regex.test(date)) {
      return stringify(parseDate(date))
    }
    if (isTimezoneAdjustment(date.slice(-6))) {
      return stringify(parseDateTime(date))
    }
    throw new Error(`Unrecognized string format for ${date}`)
  }

  const parsed_date_time = isDate(date) ? parseDateTime(date) : date
  assert(
    parsed_date_time.format === 'numeric',
    `Received ${JSON.stringify(date)}. parsed_date_time ${
      JSON.stringify(parsed_date_time)
    }`,
  )
  assertEquals(
    parsed_date_time.timezone,
    'Africa/Johannesburg',
    'Only Joburg supported for now',
  )
  const { day, month, year, hour, minute, second } = parsed_date_time
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+02:00`
}

export function stringifyJustDate(
  date: ParsedDateTime | ParsedDate | Date | string,
): string {
  const datetime_string = stringify(date)
  assert(
    datetime_string.endsWith('+02:00'),
    `Expected something representing a precise date in Johannesburg time. Got ${
      JSON.stringify(date)
    }`,
  )
  const date_string = datetime_string.slice(0, 10)
  assert(date_regex.test(date_string))
  return date_string
}

export function todayISOInJohannesburg() {
  return stringifyJustDate(parseDateTime(new Date()))
}

export function tomorrowISOInJohannesburg() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return stringifyJustDate(parseDateTime(date))
}

export function formatJohannesburg(
  date: Date | string | ParsedDate | ParsedDateTime = new Date(),
): string {
  return stringify(date)
}

export const date_regex = /^\d{4}-\d{2}-\d{2}$/
export const rfc3339_regex =
  /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/

export function differenceInDays(date1: string, date2: string): number {
  assertLength(date1, 10)
  assertLength(date2, 10)
  assert(date_regex.test(date1), `Expected ISO format: ${date1}`)
  assert(date_regex.test(date2), `Expected ISO format: ${date2}`)

  // One day in milliseconds
  const one_day = 1000 * 60 * 60 * 24

  // Calculating the time difference between two dates
  const diff_in_time = new Date(date1).getTime() - new Date(date2).getTime()

  // Calculating the no. of days between two dates
  return Math.round(diff_in_time / one_day)
}

export function differenceInMinutes(date1: Date, date2: Date): number {
  return (date1.valueOf() - date2.valueOf()) / 60000
}

// TODO: revisit this function. We should also print the day for today and tomorrow
export function prettyAppointmentTime(
  start_time: string | Date,
  timezone = 'Africa/Johannesburg',
): string {
  if (isString(start_time)) {
    assert(
      rfc3339_regex.test(start_time),
      `Expected RFC3339 format: ${start_time}`,
    )
    // assert(
    //   start_time.endsWith('+02:00'),
    //   `Expected ${start_time} to be in Johannesburg time`,
    // )
  } else {
    assert(isDate(start_time))
  }

  const start = isString(start_time) ? new Date(start_time) : start_time

  const now = formatJohannesburg()
  const diff = differenceInDays(formatJohannesburg(start), now)

  assert(diff >= 0, 'First available appointment is in the past')

  let dateStr: string
  if (diff === 0) {
    dateStr = 'Today'
  } else if (diff === 1) {
    dateStr = 'Tomorrow'
  } else {
    dateStr = new Intl.DateTimeFormat('en-gb', {
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    }).format(start)
  }

  const pretty_time = new Intl.DateTimeFormat('en-gb', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timezone,
  }).format(start)

  return `${dateStr} at ${pretty_time}`
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
  const time_start = timeInSimpleAmPm(start)
  const time_end = timeInSimpleAmPm(end)
  const same_am_pm = time_start.slice(-2) === time_end.slice(-2)
  return same_am_pm
    ? `${time_start.slice(0, -2)}-${time_end}`
    : `${time_start}-${time_end}`
}

export function isRfc3339(date: string): boolean {
  return rfc3339_regex.test(date)
}

export function isIsoJohannesburg(date: string): boolean {
  return isRfc3339(date) && date.endsWith('+02:00')
}

export function assertAllJohannesburg(dates: string[]) {
  for (const date of dates) {
    assert(
      isIsoJohannesburg(date),
      `Expected ${date} to be in Johannesburg time`,
    )
  }
}

function isLeap(year: number): boolean {
  return (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0)
}

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
  const [hour_str, minute_str, second] = time.split(':')
  assertEquals(second, '00')
  const hour = parseInt(hour_str)
  const minute = parseInt(minute_str)
  assertEquals(minute % 5, 0)
  const am_pm = hour >= 12 ? 'pm' : 'am'
  const hour_mod = hour % 12
  return {
    hour: hour_mod === 0 ? 12 : hour_mod as Time['hour'],
    minute: minute as Time['minute'],
    am_pm,
  }
}

export function convertToTimeString(time: string): string {
  const formatted_time = convertToTime(time)
  const minute = formatted_time.minute
    ? formatted_time.minute.toString().padStart(2, '0')
    : '00'
  return `${formatted_time.hour}:${minute} ${formatted_time.am_pm}`
}

export function isValidDate(message_body: string): boolean {
  const [d, m, y] = message_body.split('/')
  const year = `${y}`
  const month = `${m}`.padStart(2, '0')
  const day = `${d}`.padStart(2, '0')
  const date = new Date(
    `${year}-${month}-${day}T00:00:00Z`,
  )
  return date.toDateString() !== 'Invalid Date'
}

export function getISOInJohannesburg(date: Date) {
  const { day, month, year } = parseDateTime(date)
  return `${year}-${month}-${day}`
}

export function prettyMinimal(date_string: string, today: string) {
  const diff = differenceInDays(date_string, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  const parsed_date = parseDate(date_string)
  const parsed_today = parseDate(today)
  const day = parseInt(parsed_date.day)
  const month = monthName(parseInt(parsed_date.month) as MonthNum)
  const same_year = parsed_today.year === parsed_date.year
  return same_year ? `${day} ${month}` : `${day} ${month} ${parsed_date.year}`
}

export function durationEndDate(
  start_date: ParsedDate | ParsedDateTime | Date | string,
  duration: Duration,
): null | string {
  if (duration.duration_unit === 'indefinitely') return null
  const start = new Date(stringify(start_date))
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

export function existingDurationEndDate(
  start_date: ParsedDate | ParsedDateTime | Date | string,
  duration: DefiniteDuration,
): string {
  assertNotEquals(duration.duration_unit, 'indefinitely')
  return exists(durationEndDate(start_date, duration))
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

type FormattedDateTime = {
  date_display: string
  time_display: string
  type: 'today' | 'yesterday' | 'tomorrow' | 'past' | 'future'
}

export function isDateLike(value: unknown): value is Date | string {
  return isDate(value) || (
    isString(value) && rfc3339_regex.test(value)
  )
}

export function formatDateTime(
  date: string | Date,
): FormattedDateTime {
  date = new Date(date)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = parseDate(new Date(), timezone)
  const input_date = parseDate(date, timezone)

  const time_display = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  const date_display = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

  return {
    date_display,
    time_display,
    type: getType(),
  }

  function getType(): FormattedDateTime['type'] {
    const today_str = `${today.year}-${today.month}-${today.day}`
    const input_str = `${input_date.year}-${input_date.month}-${input_date.day}`
    const diff = differenceInDays(input_str, today_str)
    switch (diff) {
      case 0:
        return 'today'
      case 1:
        return 'tomorrow'
      case -1:
        return 'yesterday'
      default:
        return diff > 1 ? 'future' : 'past'
    }
  }
}
