import * as doctors from "./models/doctors.ts";
import * as google from "./google.ts";
import { Doctor, GoogleTokens, ReturnedSqlRow } from "./types.ts";

export async function initializeDoctor(
  tokens: GoogleTokens,
): Promise<ReturnedSqlRow<Doctor>> {
  const googleAgent = new google.Agent(tokens);

  const gettingProfile = googleAgent.getProfile();
  const gettingCalendars = googleAgent
    .ensureHasAppointmentsAndAvailabilityCalendars();

  const profile = await gettingProfile;
  const calendars = await gettingCalendars;

  return doctors.upsertWithGoogleCredentials({
    name: profile.name,
    email: profile.email,
    gcal_appointments_calendar_id: calendars.hgatAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.hgatAvailabilityCalendar.id,
    access_token: googleAgent.tokens.access_token,
    refresh_token: googleAgent.tokens.refresh_token,
  });
}
