import { assertEquals } from 'std/testing/asserts.ts'
import { Time, TimeWindow } from '../types.ts'
import { windowsOverlap, overlaps } from '../islands/set-availability-form.tsx'

function newTimeWindow(startTime: Time, endTime: Time): TimeWindow {
  const timeWindow: TimeWindow = {
    start: startTime,
    end: endTime,
  }
  return timeWindow
}

//no overlap : single time slot
Deno.test('windowsOverlap should return false for non-overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>()
  input.push(
    newTimeWindow({ hour: 9, minute: 0, amPm: 'am' }, {
      hour: 5,
      minute: 0,
      amPm: 'pm',
    }),
  )
  assertEquals(windowsOverlap(input), false)
})

//overlap:partially pattern 1 (9am-5pm and 4pm-6pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>()
  input.push(
    newTimeWindow({ hour: 9, minute: 0, amPm: 'am' }, {
      hour: 5,
      minute: 0,
      amPm: 'pm',
    }),
  )
  input.push(
    newTimeWindow({ hour: 4, minute: 0, amPm: 'pm' }, {
      hour: 6,
      minute: 0,
      amPm: 'pm',
    }),
  )
  assertEquals(windowsOverlap(input), true)
})

//overlap:partially pattern 2 (3pm-6pm and 10am-5pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>()
  input.push(
    newTimeWindow({ hour: 3, minute: 0, amPm: 'pm' }, {
      hour: 6,
      minute: 0,
      amPm: 'pm',
    }),
  )
  input.push(
    newTimeWindow({ hour: 10, minute: 0, amPm: 'am' }, {
      hour: 5,
      minute: 0,
      amPm: 'pm',
    }),
  )
  assertEquals(windowsOverlap(input), true)
})

//overlap : partially pattern 3 (10:30am-3:15pm and 11:30am-2:20pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>()
  input.push(
    newTimeWindow({ hour: 10, minute: 30, amPm: 'am' }, {
      hour: 3,
      minute: 15,
      amPm: 'pm',
    }),
  )
  input.push(
    newTimeWindow({ hour: 11, minute: 30, amPm: 'am' }, {
      hour: 2,
      minute: 20,
      amPm: 'pm',
    }),
  )
  assertEquals(windowsOverlap(input), true)
})

//ovelap : completely same time
Deno.test('windowsOverlap should return true for overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>()
  input.push(
    newTimeWindow({ hour: 3, minute: 0, amPm: 'pm' }, {
      hour: 6,
      minute: 0,
      amPm: 'pm',
    }),
  )
  input.push(
    newTimeWindow({ hour: 3, minute: 0, amPm: 'pm' }, {
      hour: 6,
      minute: 0,
      amPm: 'pm',
    }),
  )
  assertEquals(windowsOverlap(input), true)
})

Deno.test('overlaps returns true when the first window includes the othjer', () => {
  assertEquals(
    overlaps(
      {
        start: { hour: 9, minute: 0, amPm: 'am' },
        end: { hour: 5, minute: 0, amPm: 'pm' },
      },
      {
        start: { hour: 10, minute: 0, amPm: 'am' },
        end: { hour: 4, minute: 0, amPm: 'pm' },
      }
    ),
    true
  )
})

Deno.test('overlaps returns true when the second window includes the first', () => {
  assertEquals(
    overlaps(
      {
        start: { hour: 10, minute: 0, amPm: 'am' },
        end: { hour: 4, minute: 0, amPm: 'pm' },
      },
      {
        start: { hour: 9, minute: 0, amPm: 'am' },
        end: { hour: 5, minute: 0, amPm: 'pm' },
      },
    ),
    true
  )
})

Deno.test("overlaps returns false even if the windows don't overlap, even if the windows are not in chronological order", () => {
  assertEquals(
    overlaps(
      {
        start: { hour: 1, minute: 0, amPm: 'pm' },
        end: { hour: 5, minute: 0, amPm: 'pm' },
      },
      {
        start: { hour: 10, minute: 0, amPm: 'am' },
        end: { hour: 11, minute: 0, amPm: 'am' },
      }
    ),
    false
  )
})

Deno.test("overlaps returns false if two time slots do not overlap", () => {
  assertEquals(
    overlaps(
      {
        start: { hour: 9, minute: 0, amPm: 'am' },
        end: { hour: 12, minute: 0, amPm: 'am' },
      },
      {
        start: { hour: 1, minute: 0, amPm: 'pm' },
        end: { hour: 3, minute: 0, amPm: 'pm' },
      }
    ),
    false
  )
})
