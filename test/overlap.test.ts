import { assertEquals } from 'std/testing/asserts.ts'
import { TimeWindow, Time } from '../types.ts'
import { windowsOverlap } from '../islands/set-availability-form.tsx'

function newTimeWindow(startTime : Time, endTime : Time) : TimeWindow {
  const timeWindow : TimeWindow = {
    start: startTime,
    end: endTime
  }
  return timeWindow
}

//no overlap : single time slot
Deno.test('windowsOverlap should return false for non-overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>;
  input.push(newTimeWindow({hour: 9, minute: 0, amPm: "am"},{hour: 5, minute: 0, amPm: "pm"}))
  assertEquals(windowsOverlap(input),false);
})

//overlap:partially pattern 1 (9am-5pm and 4pm-6pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>;
  input.push(newTimeWindow({hour: 9, minute: 0, amPm: "am"},{hour: 5, minute: 0, amPm: "pm"}));
  input.push(newTimeWindow({hour: 4, minute: 0, amPm: "pm"},{hour: 6, minute: 0, amPm: "pm"}));
  assertEquals(windowsOverlap(input),true);
})

//overlap:partially pattern 2 (3pm-6pm and 10am-5pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>;
  input.push(newTimeWindow({hour: 3, minute: 0, amPm: "pm"},{hour: 6, minute: 0, amPm: "pm"}));
  input.push(newTimeWindow({hour: 10, minute: 0, amPm: "am"},{hour: 5, minute: 0, amPm: "pm"}));
  assertEquals(windowsOverlap(input),true);
})

//overlap : partially pattern 3 (10:30am-3:15pm and 11:30am-2:20pm)
Deno.test('windowsOverlap should return true for partially overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>;
  input.push(newTimeWindow({hour: 10, minute: 30, amPm: "am"},{hour: 3, minute: 15, amPm: "pm"}));
  input.push(newTimeWindow({hour: 11, minute: 30, amPm: "am"},{hour: 2, minute: 20, amPm: "pm"}));
  assertEquals(windowsOverlap(input),true);
})

//ovelap : completely same time
Deno.test('windowsOverlap should return true for overlapping time slots', () => {
  const input: TimeWindow[] = new Array<TimeWindow>;
  input.push(newTimeWindow({hour: 3, minute: 0, amPm: "pm"},{hour: 6, minute: 0, amPm: "pm"}));
  input.push(newTimeWindow({hour: 3, minute: 0, amPm: "pm"},{hour: 6, minute: 0, amPm: "pm"}));
  assertEquals(windowsOverlap(input),true);
}
)
