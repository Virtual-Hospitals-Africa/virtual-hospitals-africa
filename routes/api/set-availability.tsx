import { Handlers } from "$fresh/server.ts";
import { Agent } from "../../src/google.ts";
import set from "../../src/lodash/set.ts";
import { WithSession } from "https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts";
import { AvailabilityJSON, DayOfWeek } from "../../src/types.ts";

const CALENDAR_EVENT_NAME = "Virtual Hospitals Africa Availability";

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

  console.log(availability);
  return availability;
}

export const handler: Handlers<any, WithSession> = {
  async POST(req, ctx) {
    const gcal_appointments_calendar_id = ctx.state.session.get(
      "gcal_appointments_calendar_id",
    );
    const gcal_availability_calendar_id = ctx.state.session.get(
      "gcal_availability_calendar_id",
    );

    console.log("gcal_appointments_calendar_id", gcal_appointments_calendar_id);
    console.log("gcal_availability_calendar_id", gcal_availability_calendar_id);

    const agent = Agent.fromCtx(ctx);
    // const { session } = ctx.state;
    const params = new URLSearchParams(await req.text());
    const availability = parseForm(params);
    console.log("availability", JSON.stringify(availability));
    return new Response("OK", { status: 200 });
  },
};
