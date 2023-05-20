import { assert, assertEquals } from "std/testing/asserts.ts";
import { PatientDemographicInfo, Time } from "../types.ts";

export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function prettyPatientDateOfBirth(
  patient: PatientDemographicInfo,
): string {
  const [y, m, d] = patient.date_of_birth!.split("-").map((d) =>
    parseInt(d, 10)
  );
  const year = `${y}`;
  const month = `${m}`.padStart(2, "0");
  const day = `${d}`.padStart(2, "0");
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const dtDateOnly = new Date(
    date.valueOf() + date.getTimezoneOffset() * 60 * 1000,
  );
  return dtDateOnly.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function newDate(): Date {
  return new Date();
}

export const formats = {
  numeric: new Intl.DateTimeFormat("en-gb", {
    weekday: "long",
    month: "numeric",
    year: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Africa/Johannesburg",
  }),
  twoDigit: new Intl.DateTimeFormat("en-gb", {
    weekday: "long",
    month: "2-digit",
    year: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Africa/Johannesburg",
  }),
};

export function parseDate(
  date: Date,
  format: keyof typeof formats,
): ParsedDate {
  const formatter = formats[format];
  const dateString = formatter.format(date);
  const [weekday, dateParts, timeParts] = dateString.split(", ");
  const [day, month, year] = dateParts.split("/");
  const [hour, minute, second] = timeParts.split(":");
  return { weekday, day, month, year, hour, minute, second };
}

export function todayISOInHarare() {
  const { day, month, year } = parseDate(new Date(), "twoDigit");
  return `${year}-${month}-${day}`;
}

export function formatHarare(
  date = new Date(),
): string {
  const { day, month, year, hour, minute, second } = parseDate(
    date,
    "twoDigit",
  );
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+02:00`;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const rfc3339Regex =
  /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/;

export function differenceInDays(date1: string, date2: string): number {
  date1 = date1.slice(0, 10);
  date2 = date2.slice(0, 10);
  assert(dateRegex.test(date1), `Expected ISO format: ${date1}`);
  assert(dateRegex.test(date2), `Expected ISO format: ${date2}`);

  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;

  // Calculating the time difference between two dates
  const diffInTime = new Date(date1).getTime() - new Date(date2).getTime();

  // Calculating the no. of days between two dates
  return Math.round(diffInTime / oneDay);
}

const longDayFormat = new Intl.DateTimeFormat("en-gb", {
  month: "long",
  day: "numeric",
  timeZone: "Africa/Johannesburg",
});

const timeFormat = new Intl.DateTimeFormat("en-gb", {
  hour: "numeric",
  minute: "numeric",
  timeZone: "Africa/Johannesburg",
});

// TODO: revisit this function. We should also print the day for today and tomorrow
export function prettyAppointmentTime(startTime: string): string {
  assert(rfc3339Regex.test(startTime), `Expected RFC3339 format: ${startTime}`);
  assert(
    startTime.endsWith("+02:00"),
    `Expected ${startTime} to be in Harare time`,
  );

  const start = new Date(startTime);

  console.log("startTime", startTime);
  console.log("start", start);
  const now = formatHarare();
  const diff = differenceInDays(startTime, now);

  assert(diff >= 0, "First available appointment is in the past");

  let dateStr: string;
  if (diff === 0) {
    dateStr = "Today";
  } else if (diff === 1) {
    dateStr = "Tomorrow";
  } else {
    dateStr = longDayFormat.format(start);
  }

  const prettyTime = timeFormat.format(start);

  return `${dateStr} at ${prettyTime} Harare time`;
}

export function assertAllHarare(dates: string[]) {
  for (const date of dates) {
    assert(
      date.endsWith("+02:00"),
      `Expected ${date} to be in Harare time`,
    );
  }
}

const isLeap = (year: number): boolean =>
  (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);

export function numberOfDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 1:
      return 31;
    case 2:
      return isLeap(year) ? 29 : 28;
    case 3:
      return 31;
    case 4:
      return 30;
    case 5:
      return 31;
    case 6:
      return 30;
    case 7:
      return 31;
    case 8:
      return 31;
    case 9:
      return 30;
    case 10:
      return 31;
    case 11:
      return 30;
    case 12:
      return 31;
    default:
      throw new Error("Invalid month");
  }
}

export function convertToTime(date: string): Time {
  const [, timeAndZone] = date.split("T");
  const [time] = timeAndZone.split("+");
  const [hourStr, minuteStr, second] = time.split(":");
  assertEquals(second, "00");
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  assertEquals(minute % 5, 0);
  const amPm = hour >= 12 ? "pm" : "am";
  const hourMod = hour % 12;
  return {
    hour: hourMod === 0 ? 12 : hourMod as Time["hour"],
    minute: minute as Time["minute"],
    amPm,
  };
}
