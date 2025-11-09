import range from '../../util/range.ts'
import { AvailabilityJSON, DayOfWeek, TimeWindow } from '../../types.ts'
import timeToMin from '../../util/timeToMin.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { parseFormWithoutFiles } from '../../util/parseForm.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

export const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
export const minutes = range(0, 60, 5)
assertEquals(minutes.length, 12, `Minutes are in 5 minute increments`)
assertEquals(minutes[0], 0, `Minutes are in 5 minute increments`)

export function assertIsPartialAvailability(
  values: unknown,
): asserts values is Partial<AvailabilityJSON> {
  assert(isObjectLike(values))
  for (const day of Object.keys(values)) {
    assert(days.includes(day as DayOfWeek))
    assert(Array.isArray(values[day as DayOfWeek]))
  }
}

export const defaultTimeWindow: TimeWindow = {
  start: { hour: 9, minute: 0, am_pm: 'am' },
  end: { hour: 5, minute: 0, am_pm: 'pm' },
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
  time_window: TimeWindow,
  otherTimeWindow: TimeWindow,
): boolean {
  const first_time_start = timeToMin(time_window.start)
  const first_time_end = timeToMin(time_window.end)
  const second_time_start = timeToMin(otherTimeWindow.start)
  const second_time_end = timeToMin(otherTimeWindow.end)
  if (
    first_time_start > second_time_end || first_time_end < second_time_start
  ) {
    return false
  }
  return true
}

export function windowsOverlap(time_windows: TimeWindow[]): boolean {
  if (time_windows.length <= 1) return false
  const [time_window, ...rest] = time_windows
  if (rest.some((otherTimeWindow) => overlaps(time_window, otherTimeWindow))) {
    return true
  }
  return windowsOverlap(rest)
}

export function findDaysWithOverlap(event: HTMLFormElement) {
  const availability = parseFormWithoutFiles(
    new FormData(event),
    assertIsPartialAvailability,
  )
  return Object.keys(availability).filter((day) => {
    const time_windows = availability[day as DayOfWeek]
    return !!time_windows && windowsOverlap(time_windows)
  })
}
