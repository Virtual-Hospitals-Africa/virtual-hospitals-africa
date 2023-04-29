import { assert } from "std/testing/asserts.ts";
// import { format } from "https://deno.land/x/date_fns@v2.22.1/index.js"; // TODO: doesn't work
// import * as mod from "std/datetime/mod.ts";
import { PatientDemographicInfo } from "../types.ts";

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

// // TODO
export function formatHarare(
  date = new Date(),
  pattern = "yyyy-MM-d'T'HH:mm:ssXXX",
): string {
  return date.toISOString() + pattern;
  // return format(date, pattern, {});
  // return formatInTimeZone(date, "Africa/Johannesburg", pattern);
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

export function prettyAppointmentTime(startTime: string): string {
  assert(rfc3339Regex.test(startTime), `Expected RFC3339 format: ${startTime}`);
  assert(
    startTime.endsWith("+02:00"),
    `Expected ${startTime} to be in Harare time`,
  );

  const start = new Date(startTime);
  const now = formatHarare();
  const diff = differenceInDays(startTime, now);

  assert(diff >= 0, "First available appointment is in the past");

  let dateStr: string;
  if (diff === 0) {
    dateStr = "Today";
  } else if (diff === 1) {
    dateStr = "Tomorrow";
  } else {
    dateStr = format(start, "d MMMM", {});
  }

  // TODO
  const prettyTime = format(start, "hh:mm a", {}).toLowerCase();
  // const prettyTime = formatInTimeZone(start, "Africa/Johannesburg", "hh:mm a")
  //   .toLowerCase();
  return `${dateStr} at ${prettyTime} Harare time`;
}
