import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../../components/Layout.tsx";
import { WithSession } from "fresh_session";
import { AvailabilityJSON, GoogleTokens } from "../../../types.ts";
import SetAvailabilityForm from "../../../islands/set-availability-form.tsx";
import { DoctorGoogleClient } from "../../../external-clients/google.ts";
import { toHarare } from "../../api/set-availability.tsx";
function convertTo12Hour(time) {
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return { hour: hours, minute: minutes, amPm: ampm };
}
async function getAvailability(
  _tokens: GoogleTokens,
  ctx,
): Promise<AvailabilityJSON> {
  const googleClient = DoctorGoogleClient.fromCtx(ctx);
  const events = await googleClient.getEvents(
    ctx.state.session.data.gcal_availability_calendar_id,
  );
  console.log(
    "asdasfasfasdasfasfasdasfasfasdasfasfasdasfasfasdasfasfasdasfasf",
  );
  // console.log(events);
  const items = events.items;
  let schedule = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  console.log(
    "asdasfasfasdasfasfasdasfasfasdasfasfasdasfasfasdasfasfasdasfasf",
  );
  events.items.forEach((item) => {
    let startDateTime = new Date(item.start.dateTime);
    let endDateTime = new Date(item.end.dateTime);
    startDateTime.setHours(startDateTime.getHours());
    console.log(
      "start date time:",
      startDateTime,
    );
    endDateTime.setHours(endDateTime.getHours());
    console.log(
      "end date time:",
      endDateTime,
    );
    // startDateTime.

    let startTime = convertTo12Hour(startDateTime);
    let endTime = convertTo12Hour(endDateTime);

    let dayOfWeek = startDateTime.toLocaleString("en-US", { weekday: "long" });

    schedule[dayOfWeek].push({
      start: startTime,
      end: endTime,
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
    const availability = await getAvailability({
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    }, ctx);
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
