import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { assert } from "std/_util/asserts.ts";
import { getInitialTokensFromAuthCode } from "../external-clients/google.ts";
import redirect from "../util/redirect.ts";
import db from "../db/db.ts";
import * as doctors from "../db/models/doctors.ts";
import * as google from "../external-clients/google.ts";
import { Doctor, GoogleTokens, ReturnedSqlRow } from "../types.ts";

export async function initializeDoctor(
  tokens: GoogleTokens,
): Promise<ReturnedSqlRow<Doctor>> {
  const googleClient = new google.GoogleClient(tokens);

  const gettingProfile = googleClient.getProfile();
  const gettingCalendars = googleClient
    .ensureHasAppointmentsAndAvailabilityCalendars();

  const profile = await gettingProfile;
  const calendars = await gettingCalendars;

  return doctors.upsertWithGoogleCredentials(db, {
    name: profile.name,
    email: profile.email,
    gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
    access_token: googleClient.tokens.access_token,
    refresh_token: googleClient.tokens.refresh_token,
    expires_at: googleClient.tokens.expires_at,
  });
}

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(req, ctx) {
    const { session } = ctx.state;
    const code = new URL(req.url).searchParams.get("code");

    assert(code, "No code found in query params");

    const tokens = await getInitialTokensFromAuthCode(code);
    const doctor = await initializeDoctor(tokens);

    for (const [key, value] of Object.entries({ ...doctor, ...tokens })) {
      session.set(key, value);
    }

    return redirect("/app/calendar");
  },
};
