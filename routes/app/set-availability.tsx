import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import { WithSession } from "fresh_session";
import { AvailabilityJSON, GoogleTokens } from "../../src/types.ts";
import SetAvailabilityForm from "../../islands/set-availability-form.tsx";

async function getAvailability(
  _tokens: GoogleTokens,
): Promise<AvailabilityJSON> {
  return {
    Sunday: [],
    Monday: [{
      start: { hour: 9, minute: 0, amPm: "am" },
      end: { hour: 5, minute: 0, amPm: "pm" },
    }],
    Tuesday: [{
      start: { hour: 9, minute: 0, amPm: "am" },
      end: { hour: 5, minute: 0, amPm: "pm" },
    }],
    Wednesday: [{
      start: { hour: 9, minute: 0, amPm: "am" },
      end: { hour: 5, minute: 0, amPm: "pm" },
    }],
    Thursday: [{
      start: { hour: 9, minute: 0, amPm: "am" },
      end: { hour: 5, minute: 0, amPm: "pm" },
    }],
    Friday: [{
      start: { hour: 9, minute: 0, amPm: "am" },
      end: { hour: 5, minute: 0, amPm: "pm" },
    }],
    Saturday: [],
  };
}

export const handler: Handlers<
  { availability: AvailabilityJSON },
  WithSession
> = {
  async GET(_, ctx) {
    const availability = await getAvailability({
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    });

    return ctx.render({ availability });
  },
};

export default function SetAvailability(
  { data: { availability } }: PageProps<{ availability: AvailabilityJSON }>,
) {
  return (
    <Layout title="Set Availability">
      <h3 className="container p-1 text-secondary-600 uppercase">
        Working Hours
      </h3>
      <SetAvailabilityForm availability={availability} />
    </Layout>
  );
}
