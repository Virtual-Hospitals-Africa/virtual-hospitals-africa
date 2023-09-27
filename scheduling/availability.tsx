import range from '../util/range.ts'
import { AvailabilityJSON, DayOfWeek, TimeWindow } from '../types.ts'
import timeToMin from '../util/timeToMin.ts'
import isObjectLike from '../util/isObjectLike.ts'
import { parseFormWithoutFiles } from '../util/parseForm.ts'

export const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
export const minutes = range(0, 60, 5)

export function isPartialAvailability(
  values: unknown,
): values is Partial<AvailabilityJSON> {
  return isObjectLike(values) &&
    Object.keys(values).every((day) =>
      // deno-lint-ignore no-explicit-any
      days.includes(day as any) && Array.isArray(values[day])
    )
}

export const defaultTimeWindow: TimeWindow = {
  start: { hour: 9, minute: 0, amPm: 'am' },
  end: { hour: 5, minute: 0, amPm: 'pm' },
}

export const days: Array<DayOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function overlaps(
  timeWindow: TimeWindow,
  otherTimeWindow: TimeWindow,
): boolean {
  const firstTimeStart = timeToMin(timeWindow.start)
  const firstTimeEnd = timeToMin(timeWindow.end)
  const secondTimeStart = timeToMin(otherTimeWindow.start)
  const secondTimeEnd = timeToMin(otherTimeWindow.end)
  if (firstTimeStart > secondTimeEnd || firstTimeEnd < secondTimeStart) {
    return false
  }
  return true
}

export function windowsOverlap(timeWindows: TimeWindow[]): boolean {
  if (timeWindows.length <= 1) return false
  const [timeWindow, ...rest] = timeWindows
  if (rest.some((otherTimeWindow) => overlaps(timeWindow, otherTimeWindow))) {
    return true
  }
  return windowsOverlap(rest)
}

export function findDaysWithOverlap(event: HTMLFormElement) {
  const availability = parseFormWithoutFiles(
    new FormData(event),
    isPartialAvailability,
  )
  return Object.keys(availability).filter((day) => {
    const timeWindows = availability[day as DayOfWeek]
    return !!timeWindows && windowsOverlap(timeWindows)
  })
}
