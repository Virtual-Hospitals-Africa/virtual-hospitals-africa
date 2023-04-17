import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/Layout.tsx";
import { WithSession } from "https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts";
import { isGoogleTokens } from "../src/google.ts";
import { AvailabilityJSON, GoogleTokens } from "../src/types.ts";
import SetAvailabilityForm from "../islands/set-availability-form.tsx";

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
    const tokens = {
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    };

    if (!isGoogleTokens(tokens)) {
      console.warn("Where is that large automobile?");
      return new Response("Found", {
        status: 302,
        headers: { Location: "/" },
      });
    }

    const availability = await getAvailability(tokens);

    return ctx.render({ availability });
  },
};

export default function SetAvailability(
  { data: { availability } }: PageProps<{ availability: AvailabilityJSON }>,
) {
  return (
    <Layout title="Set Availability">
      <SetAvailabilityForm availability={availability} />
    </Layout>
  );
}
