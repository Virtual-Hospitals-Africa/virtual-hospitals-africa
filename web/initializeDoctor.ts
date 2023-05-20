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

  return db.transaction().execute((trx) => 
    doctors.upsertWithGoogleCredentials(trx, {
      name: profile.name,
      email: profile.email,
      gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
      gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
      access_token: googleClient.tokens.access_token,
      refresh_token: googleClient.tokens.refresh_token,
    })
  );
}
