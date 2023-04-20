import { Handlers } from "$fresh/server.ts";
import { Agent } from "../../src/google.ts";
import set from "../../src/lodash/set.ts";
import { WithSession } from "fresh_session";
import {
  AvailabilityJSON,
  DayOfWeek,
  DeepPartial,
  GCalEvent,
  Time,
} from "../../src/types.ts";
import padLeft from "../../src/lodash/padLeft.ts";
import redirect from "../../src/redirect.ts";
import { assert } from "std/_util/asserts.ts";

const days: Array<DayOfWeek> = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseForm(params: URLSearchParams): AvailabilityJSON {
  const availability = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  params.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value) ? parseInt(value) : value;
    set(availability, key, toSet);
  });

  return availability;
}

const dateFormat = new Intl.DateTimeFormat("en-gb", {
  weekday: "long",
  month: "numeric",
  year: "numeric",
  day: "numeric",
  timeZone: "Africa/Johannesburg",
});

function parseDate(date: Date = new Date()) {
  const dateString = dateFormat.format(date);
  const [weekday, rest] = dateString.split(", ");
  const [day, month, year] = rest.split("/");
  return { weekday, day, month, year };
}

const toHarare = (time: Time) => {
  console.log("time", time);
  const baseHour = time.hour % 12;
  const hour = time.amPm === "am" ? baseHour : baseHour + 12;
  const hourStr = padLeft(String(hour), 2, "0");
  const minuteStr = padLeft(String(time.minute), 2, "0");
  return `${hourStr}:${minuteStr}:00+02:00`;
};

function* availabilityBlocks(
  availability: AvailabilityJSON,
): Generator<DeepPartial<GCalEvent>> {
  const today = parseDate();
  const todayIndex = days.indexOf(today.weekday as DayOfWeek);
  for (const day of days) {
    const dayAvailability = availability[day];
    const dayIndex = days.indexOf(day);
    const dayOffset = dayIndex - todayIndex;
    const dayDate = new Date(
      Date.UTC(
        parseInt(today.year),
        parseInt(today.month) - 1,
        parseInt(today.day),
      ),
    );
    dayDate.setDate(dayDate.getDate() + dayOffset);
    const dayStr = dayDate.toISOString().split("T")[0];

    for (const timeWindow of dayAvailability) {
      const start = toHarare(timeWindow.start);
      const end = toHarare(timeWindow.end);

      yield {
        summary: "Availability Block",
        start: {
          dateTime: `${dayStr}T${start}`,
          timeZone: "Africa/Johannesburg",
        },
        end: { dateTime: `${dayStr}T${end}`, timeZone: "Africa/Johannesburg" },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${day.slice(0, 2).toUpperCase()}`,
        ],
      };
    }
  }
}

export const handler: Handlers<any, WithSession> = {
  async POST(req, ctx) {
    const params = new URLSearchParams(await req.text());
    const availability = parseForm(params);

    const gcal_availability_calendar_id = ctx.state.session.get(
      "gcal_availability_calendar_id",
    );

    assert(gcal_availability_calendar_id, "No calendar ID found in session");

    const agent = Agent.fromCtx(ctx);

    const existingAvailability = await agent.getEvents(
      gcal_availability_calendar_id,
    );

    const existingAvailabilityEvents = existingAvailability.items || [];

    // Google rate limits you if you try to do these in parallel :(
    // TODO: revisit whether to clear all these out
    for (const event of existingAvailabilityEvents) {
      await agent.deleteEvent(gcal_availability_calendar_id, event.id);
    }
    for (const event of availabilityBlocks(availability)) {
      await agent.insertEvent(gcal_availability_calendar_id, event);
    }

    // TODO: Redirect to calendar
    return redirect("/app/calendar?availability-set=true");
  },
};
