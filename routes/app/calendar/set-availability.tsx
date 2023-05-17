import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../../components/Layout.tsx";
import { WithSession } from "fresh_session";
import { AvailabilityJSON, GoogleTokens, Time } from "../../../types.ts";
import SetAvailabilityForm from "../../../islands/set-availability-form.tsx";
import { DoctorGoogleClient } from "../../../external-clients/google.ts";
import { assertAllHarare } from "../../../util/date.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";

function convertToTime(date: string): Time {
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

const shortToLong = {
  SU: "Sunday" as const,
  MO: "Monday" as const,
  TU: "Tuesday" as const,
  WE: "Wednesday" as const,
  TH: "Thursday" as const,
  FR: "Friday" as const,
  SA: "Saturday" as const,
};

async function getAvailability(
  ctx: HandlerContext<{
    availability: AvailabilityJSON;
  }, WithSession>,
): Promise<AvailabilityJSON> {
  const googleClient = DoctorGoogleClient.fromCtx(ctx);
  const events = await googleClient.getEvents(
    ctx.state.session.data.gcal_availability_calendar_id,
  );
  const items = events.items;
  console.log("items", items);
  const schedule: AvailabilityJSON = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  events.items.forEach((item) => {
    assertAllHarare([item.start.dateTime, item.end.dateTime]);
    assert(Array.isArray(item.recurrence));
    assertEquals(item.recurrence.length, 1);
    assert(item.recurrence[0].startsWith("RRULE:FREQ=WEEKLY;BYDAY="));
    const dayStr = item.recurrence[0].replace("RRULE:FREQ=WEEKLY;BYDAY=", "");
    assert(dayStr in shortToLong);

    const weekday = shortToLong[dayStr as keyof typeof shortToLong];

    schedule[weekday].push({
      start: convertToTime(item.start.dateTime),
      end: convertToTime(item.end.dateTime),
    });
  });
  console.log(schedule);
  return Promise.resolve(schedule);
}

export const handler: Handlers<
  { availability: AvailabilityJSON },
  WithSession
> = {
  async GET(_, ctx) {
    const availability = await getAvailability(ctx);
    return ctx.render({ availability });
  },
};

export default function SetAvailability(
  props: PageProps<{ availability: AvailabilityJSON }>,
) {
  return (
    <Layout title="Set Availability" route={props.route}>
      <h3 className="container p-1 text-secondary-600 uppercase">
        Working Hours for Doctors
      </h3>
      <SetAvailabilityForm availability={props.data.availability} />
    </Layout>
  );
}
