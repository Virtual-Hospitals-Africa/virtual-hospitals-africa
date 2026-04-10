import { H as HealthWorkerHomePage, a2 as promiseProps, r as redirect, x as HealthWorkerGoogleClient, dj as assertAllJohannesburg, m as assert, S as assertEquals, dk as convertToTime, u, dl as AvailabilityForm, dm as forEach, z, cW as parseDateTime, a5 as todayISOInJohannesburg, dn as formatJohannesburg, dp as padTime, dq as nonnegative_integer, cL as positive_integer } from "../server-entry.mjs";
import "./logged-in-a71NwH5Q.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { e as employment_calendars } from "./employment_calendars-DTp7pD3u.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./media-DY7RW76U.mjs";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const short_to_long = {
  SU: "Sunday",
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday"
};
const toJohannesburg = (time) => {
  const base_hour = time.hour % 12;
  const hour = time.am_pm === "am" ? base_hour : base_hour + 12;
  const hour_str = padTime(hour);
  const minute_str = padTime(time.minute);
  return `${hour_str}:${minute_str}:00+02:00`;
};
function* availabilityBlocks(availability2) {
  const today = parseDateTime(todayISOInJohannesburg());
  const today_index = days.indexOf(today.weekday);
  for (const day of days) {
    const day_availability = availability2[day];
    if (!day_availability) continue;
    const day_index = days.indexOf(day);
    const day_offset = day_index - today_index;
    const day_date = new Date(Date.UTC(parseInt(today.year), parseInt(today.month) - 1, parseInt(today.day)));
    day_date.setDate(day_date.getDate() + day_offset);
    const day_str = formatJohannesburg(day_date).split("T")[0];
    for (const time_window of day_availability) {
      const start = toJohannesburg(time_window.start);
      const end = toJohannesburg(time_window.end);
      yield {
        summary: "Availability Block",
        start: {
          dateTime: `${day_str}T${start}`,
          timeZone: "Africa/Johannesburg"
        },
        end: {
          dateTime: `${day_str}T${end}`,
          timeZone: "Africa/Johannesburg"
        },
        recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${day.slice(0, 2).toUpperCase()}`]
      };
    }
  }
}
const TimeSchema = z.object({
  hour: positive_integer.refine((hour) => hour >= 1 && hour <= 12, {
    message: "expected an hour in the range 1-12"
  }),
  minute: nonnegative_integer.refine((minute) => minute >= 0 && minute <= 59, {
    message: "expected a minute in the range 0-59"
  }),
  am_pm: z.enum(["am", "pm"])
});
const TimeWindowSchema = z.object({
  start: TimeSchema,
  end: TimeSchema
});
const AvailabilitySchema = z.object({
  Sunday: TimeWindowSchema.array().optional(),
  Monday: TimeWindowSchema.array().optional(),
  Tuesday: TimeWindowSchema.array().optional(),
  Wednesday: TimeWindowSchema.array().optional(),
  Thursday: TimeWindowSchema.array().optional(),
  Friday: TimeWindowSchema.array().optional(),
  Saturday: TimeWindowSchema.array().optional()
});
async function writeCalendarsToGoogle(ctx, availability2) {
  const calendar_record = await ctx.state.trx.selectFrom("employment_calendars").where("employment_id", "=", ctx.state.organization_employment.employment_id).select("gcal_availability_calendar_id").executeTakeFirst();
  let gcal_availability_calendar_id = calendar_record?.gcal_availability_calendar_id;
  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx);
  if (!gcal_availability_calendar_id) {
    const calendars = await google_client.ensureHasAppointmentsAndAvailabilityCalendars(ctx.state.organization);
    await employment_calendars.add(ctx.state.trx, [{
      ...calendars,
      employment_id: ctx.state.organization_employment.employment_id
    }]);
    gcal_availability_calendar_id = calendars.gcal_availability_calendar_id;
  }
  const existing_availability = await google_client.getActiveEvents(gcal_availability_calendar_id);
  const existing_availability_events = existing_availability.items || [];
  await forEach(existing_availability_events, (event) => google_client.deleteEvent(gcal_availability_calendar_id, event.id));
  await forEach(availabilityBlocks(availability2), (event) => google_client.insertEvent(gcal_availability_calendar_id, event));
}
const handler$1 = postHandler(AvailabilitySchema, async (ctx, form_values) => {
  const {
    trx,
    organization_employment
  } = ctx.state;
  const from_url = !!ctx.url.searchParams.get("from_url");
  await promiseProps({
    marking_availability_set: employment_calendars.markAvailabilitySet(trx, organization_employment.employment_id),
    write_calendars_to_google: writeCalendarsToGoogle(ctx, form_values)
  });
  const success = encodeURIComponent("Thanks! With your availability updated your coworkers can now book appointments with you and know when you are available 📆");
  const next_page = from_url || "/app/calendar";
  return redirect(`${next_page}?success=${success}`);
});
const availability = HealthWorkerHomePage("Set Availability", async function SetAvailability(ctx) {
  const {
    trx,
    organization_employment
  } = ctx.state;
  const from_url = ctx.url.searchParams.get("from_url");
  const calendars = await employment_calendars.findOneOptional(trx, organization_employment);
  const gcal_availability_calendar_id = calendars?.gcal_availability_calendar_id;
  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx);
  const events = gcal_availability_calendar_id ? await google_client.getActiveEvents(gcal_availability_calendar_id) : {
    items: []
  };
  const availability2 = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };
  if (events.items.length && !!from_url) {
    await employment_calendars.markAvailabilitySet(trx, organization_employment.employee_id);
    return redirect("/app");
  }
  events.items.forEach((item) => {
    assertAllJohannesburg([item.start.dateTime, item.end.dateTime]);
    assert(Array.isArray(item.recurrence));
    assertEquals(item.recurrence.length, 1);
    assert(item.recurrence[0].startsWith("RRULE:FREQ=WEEKLY;BYDAY="));
    const day_str = item.recurrence[0].replace("RRULE:FREQ=WEEKLY;BYDAY=", "");
    assert(day_str in short_to_long);
    const weekday = short_to_long[day_str];
    availability2[weekday].push({
      start: convertToTime(item.start.dateTime),
      end: convertToTime(item.end.dateTime)
    });
  });
  return u(AvailabilityForm, {
    availability: availability2
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_availability = availability;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_availability as default,
  handler,
  handlers
};
