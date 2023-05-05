import * as doctors from "../models/doctors.ts";
import * as google from "../external-clients/google.ts";
import { Doctor, GoogleTokens, ReturnedSqlRow } from "../types.ts";

export async function initializeDoctor(
  tokens: GoogleTokens,
): Promise<ReturnedSqlRow<Doctor>> {
  const googleGoogleClient = new google.GoogleClient(tokens);

  const gettingProfile = googleGoogleClient.getProfile();
  const gettingCalendars = googleGoogleClient
    .ensureHasAppointmentsAndAvailabilityCalendars();

  const profile = await gettingProfile;
  const calendars = await gettingCalendars;

  return doctors.upsertWithGoogleCredentials({
    name: profile.name,
    email: profile.email,
    gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
    access_token: googleGoogleClient.doctor.access_token,
    refresh_token: googleGoogleClient.doctor.refresh_token,
  });
}
